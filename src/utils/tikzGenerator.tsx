import { Node, Edge } from "../types";

/**
 * Ermittelt die relative Position eines Knotens zu einem bereits verarbeiteten Nachbarknoten.
 * Das Ergebnis ist ein für TikZ formatierter String, z.B. "[right=of q0]".
 * Dies ermöglicht es TikZ, die Knoten automatisch anzuordnen, anstatt absolute Koordinaten zu verwenden.
 * @param node Der Knoten, für den die relative Position bestimmt werden soll.
 * @param allNodes Eine Liste aller Knoten im Graphen.
 * @param processedNodes Ein Set von IDs der Knoten, die bereits im TikZ-Code deklariert wurden.
 * @returns Ein String für die relative Positionierung in TikZ oder ein leerer String, wenn keine relative Positionierung möglich ist.
 */
const getRelativePosition = (
  node: Node,
  allNodes: Node[],
  processedNodes: Set<string>
) => {
  // Sortiere alle Knoten numerisch, um einen stabilen Referenzknoten (q0) zu haben.
  const sortedNodes = [...allNodes].sort((a, b) => {
    const aNum = parseInt(a.id.substring(1));
    const bNum = parseInt(b.id.substring(1));
    return aNum - bNum;
  });
  const referenceNode = sortedNodes[0];

  // Der erste Knoten (q0) benötigt keine relative Position.
  if (node.id === referenceNode.id) {
    return "";
  }

  // Initialisiere die Suche mit dem Referenzknoten als bestem Kandidaten.
  let closestNode = referenceNode;
  let minDistance = Infinity;

  // Finde den nächstgelegenen, bereits verarbeiteten Knoten in derselben Zeile oder Spalte.
  // Dies wird bevorzugt, um saubere `right=of` oder `below=of` Anweisungen zu erzeugen.
  for (const otherNode of allNodes) {
    if (otherNode.id === node.id) continue;
    if (!processedNodes.has(otherNode.id)) continue;

    // Berechne die Distanz auf dem Grid.
    const distance =
      Math.abs(node.gridX - otherNode.gridX) +
      Math.abs(node.gridY - otherNode.gridY);

    const sameRow = node.gridY === otherNode.gridY;
    const sameCol = node.gridX === otherNode.gridX;

    // Wenn der Knoten in derselben Zeile/Spalte liegt und näher ist, merke ihn dir.
    if ((sameRow || sameCol) && distance < minDistance) {
      minDistance = distance;
      closestNode = otherNode;
    }
  }

  // Fallback: Wenn der "nächste" Knoten doch noch nicht verarbeitet wurde,
  // aber der erste Knoten (q0) schon, verwende q0 als Referenz.
  if (
    !processedNodes.has(closestNode.id) &&
    processedNodes.has(referenceNode.id)
  ) {
    closestNode = referenceNode;
  }

  // Berechne die Differenz der Grid-Koordinaten zum gefundenen Referenzknoten
  const deltaX = node.gridX - closestNode.gridX;
  const deltaY = node.gridY - closestNode.gridY;

  // Erzeuge den TikZ-Positionierungsstring basierend auf der Richtung.
  let position = "";
  if (deltaX > 0 && deltaY === 0) {
    position = `right=of ${closestNode.label}`;
  } else if (deltaX < 0 && deltaY === 0) {
    position = `left=of ${closestNode.label}`;
  } else if (deltaY > 0 && deltaX === 0) {
    position = `below=of ${closestNode.label}`;
  } else if (deltaY < 0 && deltaX === 0) {
    position = `above=of ${closestNode.label}`;
  }

  // Gib den formatierten String zurück, falls eine Position gefunden wurde.
  return position ? ` [${position}]` : "";
};

/**
 * Hilfsfunktion, um zu prüfen, ob ein direkter Nachbar in einer bestimmten Richtung existiert.
 * Ein direkter Nachbar ist 2 Grid-Einheiten entfernt.
 * @param node Der Ausgangsknoten.
 * @param allNodes Liste aller Knoten.
 * @param direction Die zu prüfende Richtung.
 * @returns Den Nachbarknoten, falls gefunden, ansonsten `null`.
 */
const findDirectNeighbor = (
  node: Node,
  allNodes: Node[],
  direction: "left" | "right" | "above" | "below"
): Node | null => {
  for (const otherNode of allNodes) {
    if (otherNode.id === node.id) continue;

    switch (direction) {
      case "right":
        if (
          otherNode.gridX === node.gridX + 2 &&
          otherNode.gridY === node.gridY
        ) {
          return otherNode;
        }
        break;
      case "left":
        if (
          otherNode.gridX === node.gridX - 2 &&
          otherNode.gridY === node.gridY
        ) {
          return otherNode;
        }
        break;
      case "below":
        if (
          otherNode.gridY === node.gridY + 2 &&
          otherNode.gridX === node.gridX
        ) {
          return otherNode;
        }
        break;
      case "above":
        if (
          otherNode.gridY === node.gridY - 2 &&
          otherNode.gridX === node.gridX
        ) {
          return otherNode;
        }
        break;
    }
  }
  return null;
};

/**
 * Generiert den vollständigen TikZ-Code für den aktuellen Automaten.
 * @param nodes Die Liste der Knoten.
 * @param edges Die Liste der Kanten.
 * @returns Ein String, der den TikZ-Code enthält.
 */
export const generateTikzCode = (nodes: Node[], edges: Edge[]) => {
  // Initialisiert den TikZ-Code mit den Standardoptionen für Automaten.
  let tikzCode = `\\begin{tikzpicture}[->, shorten >=1pt,node distance=2cm,on grid,auto]\n`;

  // Sortiere Knoten nach ihrer numerischen ID (q0, q1, q2, ...)
  const sortedNodes = [...nodes].sort((a, b) => {
    const aNum = parseInt(a.id.substring(1));
    const bNum = parseInt(b.id.substring(1));
    return aNum - bNum;
  });

  // OPTIMIERUNG: Bestimme die beste Reihenfolge für die Knotendeklaration in TikZ.
  // Ziel ist, dass ein Knoten immer relativ zu einem bereits deklarierten Knoten positioniert wird.
  // Das verhindert "node not defined" Fehler in LaTeX.
  const optimizedOrder: Node[] = [];
  const processedNodes = new Set<string>();

  // Beginne mit dem ersten Knoten (q0)
  if (sortedNodes.length > 0) {
    optimizedOrder.push(sortedNodes[0]);
    processedNodes.add(sortedNodes[0].id);
  }

  // Füge Knoten in einer Reihenfolge hinzu, die TikZ-Referenzen respektiert
  while (optimizedOrder.length < sortedNodes.length) {
    let addedInThisRound = false;

    for (const node of sortedNodes) {
      if (processedNodes.has(node.id)) continue;

      // Prüfe, ob wir einen direkten Nachbarn haben, der bereits verarbeitet wurde
      const hasProcessedNeighbor = ["left", "right", "above", "below"].some(
        (direction) => {
          const neighbor = findDirectNeighbor(
            node,
            sortedNodes,
            direction as any
          );
          // Ein Nachbar ist nur gültig, wenn er existiert UND bereits verarbeitet wurde.
          return neighbor && processedNodes.has(neighbor.id);
        }
      );

      // Wenn ein verarbeiteter Nachbar existiert, ist dieser Knoten ein guter nächster Kandidat.
      if (hasProcessedNeighbor) {
        optimizedOrder.push(node);
        processedNodes.add(node.id);
        addedInThisRound = true;
      }
    }

    // Fallback: Wenn in einer Runde kein Knoten mit einem verarbeiteten Nachbarn gefunden wurde
    // (kann bei "losgelösten" Graphenteilen oder nach Undo-Operationen passieren),
    // füge einfach den nächsten unverarbeiteten Knoten aus der sortierten Liste hinzu.
    if (!addedInThisRound) {
      for (const node of sortedNodes) {
        if (!processedNodes.has(node.id)) {
          optimizedOrder.push(node);
          processedNodes.add(node.id);
          break;
        }
      }
    }
  }

  // Reset für die finale Verarbeitung
  processedNodes.clear();

  // Iteriere durch die OPTIMIERTE Reihenfolge, um die \node-Befehle zu erstellen.
  optimizedOrder.forEach((node) => {
    const relativePos = getRelativePosition(node, nodes, processedNodes);
    let nodeOptions = [];

    if (node.isStart) nodeOptions.push("initial");
    if (node.isAccepting) nodeOptions.push("accepting");

    const optionsStr =
      nodeOptions.length > 0 ? `[state,${nodeOptions.join(",")}]` : "[state]";

    // Füge den \node Befehl zum TikZ-Code hinzu.
    tikzCode += `  \\node${optionsStr} (${node.label})${relativePos} {$${node.label}$};\n`;
    processedNodes.add(node.id);
  });

  tikzCode += `\n`;

  // --- Generierung des Edge-Codes ---
  tikzCode += `  \\draw\n`;
  const edgeLines: string[] = [];

  edges.forEach((edge) => {
    let edgeOptions = [];

    if (edge.style.isLoop) {
      edgeOptions.push(`loop ${edge.style.loopPosition}`);
    } else {
      if (edge.style.bend !== "none") {
        const bendAmount = edge.style.bendAmount || 30;
        if (bendAmount !== 30) {
          edgeOptions.push(`bend ${edge.style.bend}=${bendAmount}`);
        } else {
          edgeOptions.push(`bend ${edge.style.bend}`);
        }
      }
      if (edge.style.labelPosition !== "above") {
        edgeOptions.push(edge.style.labelPosition);
      }
    }

    const optionsStr =
      edgeOptions.length > 0 ? `[${edgeOptions.join(", ")}]` : "";
    const nodeStr = ` node{${edge.label}}`;

    const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
    const toNode = nodes.find((n) => n.id === edge.toNodeId);

    const fromLabel = fromNode?.label || edge.fromNodeId;
    const toLabel = toNode?.label || edge.toNodeId;

    edgeLines.push(
      `    (${fromLabel}) edge${optionsStr}${nodeStr} (${toLabel})`
    );
  });

  tikzCode += edgeLines.join("\n") + ";\n";
  tikzCode += `\\end{tikzpicture}`;

  return tikzCode;
};
