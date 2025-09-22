import { Node, Edge } from "../types";

const getRelativePosition = (
  node: Node,
  allNodes: Node[],
  processedNodes: Set<string>
) => {
  const sortedNodes = [...allNodes].sort((a, b) => {
    const aNum = parseInt(a.id.substring(1));
    const bNum = parseInt(b.id.substring(1));
    return aNum - bNum;
  });
  const referenceNode = sortedNodes[0];

  if (node.id === referenceNode.id) {
    return "";
  }

  let closestNode = referenceNode;
  let minDistance = Infinity;

  // Finde den besten bereits verarbeiteten Knoten als Referenz
  for (const otherNode of allNodes) {
    if (otherNode.id === node.id) continue;
    if (!processedNodes.has(otherNode.id)) continue;

    const distance =
      Math.abs(node.gridX - otherNode.gridX) +
      Math.abs(node.gridY - otherNode.gridY);

    const sameRow = node.gridY === otherNode.gridY;
    const sameCol = node.gridX === otherNode.gridX;

    if ((sameRow || sameCol) && distance < minDistance) {
      minDistance = distance;
      closestNode = otherNode;
    }
  }

  // Fallback: Verwende den ersten Knoten, falls verfügbar
  if (
    !processedNodes.has(closestNode.id) &&
    processedNodes.has(referenceNode.id)
  ) {
    closestNode = referenceNode;
  }

  const deltaX = node.gridX - closestNode.gridX;
  const deltaY = node.gridY - closestNode.gridY;

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

  return position ? ` [${position}]` : "";
};

// Hilfsfunktion um herauszufinden, welche Knoten direkt nebeneinander liegen
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

export const generateTikzCode = (nodes: Node[], edges: Edge[]) => {
  let tikzCode = `\\begin{tikzpicture}[->, shorten >=1pt,node distance=2cm,on grid,auto]\n`;

  // Sortiere Knoten nach ihrer numerischen ID (q0, q1, q2, ...)
  const sortedNodes = [...nodes].sort((a, b) => {
    const aNum = parseInt(a.id.substring(1));
    const bNum = parseInt(b.id.substring(1));
    return aNum - bNum;
  });

  // Erstelle eine optimierte Reihenfolge basierend auf Positionen
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
          return neighbor && processedNodes.has(neighbor.id);
        }
      );

      if (hasProcessedNeighbor) {
        optimizedOrder.push(node);
        processedNodes.add(node.id);
        addedInThisRound = true;
      }
    }

    // Fallback: Füge den nächsten Knoten hinzu, auch wenn er keinen direkten Nachbarn hat, kann bei Undo passieren
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

  // Detaillierte TikZ code erstellung mit relativen Postionen
  optimizedOrder.forEach((node) => {
    const relativePos = getRelativePosition(node, nodes, processedNodes);
    let nodeOptions = [];

    if (node.isStart) nodeOptions.push("initial");
    if (node.isAccepting) nodeOptions.push("accepting");

    const optionsStr =
      nodeOptions.length > 0 ? `[state,${nodeOptions.join(",")}]` : "[state]";

    tikzCode += `  \\node${optionsStr} (${node.label})${relativePos} {$${node.label}$};\n`;
    processedNodes.add(node.id);
  });

  tikzCode += `\n`;

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
