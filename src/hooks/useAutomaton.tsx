import { useState } from "react";
import { Node, Edge, EdgeStyle } from "../types";

// Der Hook gibt ein Objekt zurück, das den aktuellen Zustand und Funktionen zur Manipulation enthält
export const useAutomaton = () => {
  // State für die Liste aller Knoten im Automaten
  const [nodes, setNodes] = useState<Node[]>([]);
  // State für die Liste aller Kanten im Automaten
  const [edges, setEdges] = useState<Edge[]>([]);
  // State, um die ID des nächsten zu erstellenden Knotens zu verfolgen (z.B. q0, q1, q2...)
  const [nextNodeId, setNextNodeId] = useState(0);

  /**
   * Verschiebt alle Knoten ab einer bestimmten Koordinate in eine Richtung, um Platz zu schaffen.
   * Dies wird aufgerufen, bevor ein neuer Knoten an einer bereits belegten "Spur" eingefügt wird
   * @param direction Die Richtung, in die verschoben wird ('right', 'left', 'up', 'down')
   * @param fromX Die X-Koordinate, ab der verschoben wird
   * @param fromY Die Y-Koordinate, ab der verschoben wird
   */
  const shiftNodes = (
    direction: "right" | "left" | "up" | "down",
    fromX: number,
    fromY: number
  ) => {
    setNodes((prevNodes) =>
      // Wir durchlaufen alle bisherigen Knoten.
      prevNodes.map((node) => {
        // Basierend auf der Richtung prüfen wir, ob der aktuelle Knoten verschoben werden muss.
        switch (direction) {
          case "right":
            // Wenn der Knoten auf oder rechts von fromX liegt, verschiebe ihn um 2 Einheiten nach rechts
            return node.gridX >= fromX
              ? { ...node, gridX: node.gridX + 2 }
              : node;
          case "left":
            return node.gridX <= fromX
              ? { ...node, gridX: node.gridX - 2 }
              : node;
          case "up":
            return node.gridY <= fromY
              ? { ...node, gridY: node.gridY - 2 }
              : node;
          case "down":
            return node.gridY >= fromY
              ? { ...node, gridY: node.gridY + 2 }
              : node;
          default:
            return node;
        }
      })
    );
  };

  /**
   * Fügt den allerersten Knoten (q0) hinzu, wenn das Canvas leer ist
   * Dieser wird standardmäßig zum Startzustand
   */
  const addFirstNode = () => {
    if (nodes.length === 0) {
      const newNode: Node = {
        id: `q${nextNodeId}`,
        gridX: 0,
        gridY: 0,
        label: `q${nextNodeId}`,
        isStart: true,
        isAccepting: false,
      };
      setNodes([newNode]);
      setNextNodeId(nextNodeId + 1);
    }
  };

  /**
   * Fügt einen neuen Knoten relativ zu einem ausgewählten Knoten hinzu.
   * @param direction Die Richtung, in der der neue Knoten erstellt wird.
   * @param selectedNodeId Die ID des Knotens, von dem aus der neue Knoten erstellt wird
   */
  const addNode = (
    direction: "right" | "left" | "up" | "down",
    selectedNodeId: string | null
  ) => {
    // Funktion wird nur ausgeführt, wenn ein Knoten ausgewählt ist
    if (!selectedNodeId) return;
    const currentNode = nodes.find((n) => n.id === selectedNodeId);
    if (!currentNode) return;

    // Gebraucht für relative Positionierung
    let newX = currentNode.gridX;
    let newY = currentNode.gridY;

    // Berechne die Koordinaten des neuen Knotens und prüfe, ob Platz geschaffen werden muss
    switch (direction) {
      case "right":
        newX += 2;
        // Bevor der Knoten hinzugefügt wird, prüfen wir, ob auf der Ziel-X-Koordinate
        // oder weiter rechts bereits Knoten existieren. Wenn ja, rufen wir shiftNodes auf
        if (nodes.some((n) => n.gridX >= newX && n.gridY === newY)) {
          shiftNodes("right", newX, newY);
        }
        break;
      case "left":
        newX -= 2;
        if (nodes.some((n) => n.gridX <= newX && n.gridY === newY)) {
          shiftNodes("left", newX, newY);
        }
        break;
      case "up":
        newY -= 2;
        if (nodes.some((n) => n.gridY <= newY && n.gridX === newX)) {
          shiftNodes("up", newX, newY);
        }
        break;
      case "down":
        newY += 2;
        if (nodes.some((n) => n.gridY >= newY && n.gridX === newX)) {
          shiftNodes("down", newX, newY);
        }
        break;
    }

    // Erstelle das neue Knoten-Objekt.
    const newNode: Node = {
      id: `q${nextNodeId}`,
      gridX: newX,
      gridY: newY,
      label: `q${nextNodeId}`,
      isStart: false,
      isAccepting: false,
    };

    // Füge den neuen Knoten zum State hinzu.
    setNodes((prev) => [...prev, newNode]);
    setNextNodeId(nextNodeId + 1);
  };

  /**
   * Schaltet isStart-Zustand um
   * @param selectedNodeId Die ID des umzuschaltenden Knotens
   */
  const toggleStart = (selectedNodeId: string | null) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((node) =>
        node.id === selectedNodeId ? { ...node, isStart: !node.isStart } : node
      )
    );
  };

  /**
   * Schaltet den isAccepting-Zustand um
   * @param selectedNodeId Die ID des umzuschaltenden Knotens.
   */
  const toggleAccepting = (selectedNodeId: string | null) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((node) =>
        node.id === selectedNodeId
          ? { ...node, isAccepting: !node.isAccepting }
          : node
      )
    );
  };

  /**
   * Fügt eine neue Kante zwischen zwei Knoten hinzu
   * @param fromNodeId Die ID des Startknotens der Kante
   * @param toNodeId Die ID des Endknotens der Kante
   */
  const addEdge = (fromNodeId: string, toNodeId: string) => {
    // Prüft, ob es sich um eine Schleife handelt (Start und Endknoten sind identisch).
    const isLoop = fromNodeId === toNodeId;
    const newEdge: Edge = {
      id: `edge_${Date.now()}`, // Eindeutige ID
      fromNodeId,
      toNodeId,
      label: "a", // Standard-Label
      style: {
        bendAmount: 30,
        bend: "none",
        labelPosition: "above",
        isLoop,
        loopPosition: isLoop ? "above" : undefined,
      },
    };
    setEdges((prev) => [...prev, newEdge]);
  };

  /**
   * Aktualisiert die Stil-Eigenschaften einer Kante (Biegung, Label-Position, ...).
   * @param edgeId Die ID der zu aktualisierenden Kante
   * @param styleUpdate Ein Objekt mit den neuen Stil-Eigenschaften
   */
  const updateEdgeStyle = (edgeId: string, styleUpdate: Partial<EdgeStyle>) => {
    setEdges((prev) =>
      prev.map((edge) =>
        edge.id === edgeId
          ? { ...edge, style: { ...edge.style, ...styleUpdate } }
          : edge
      )
    );
  };

  /**
   * Aktualisiert das Text-Label einer Kante.
   * @param edgeId Die ID der zu aktualisierenden Kante.
   * @param label Das neue Label.
   */
  const updateEdgeLabel = (edgeId: string, label: string) => {
    setEdges((prev) =>
      prev.map((edge) => (edge.id === edgeId ? { ...edge, label } : edge))
    );
  };

  /**
   * Aktualisiert das Text-Label eines Knotens.
   * @param nodeId Die ID des zu aktualisierenden Knotens.
   * @param label Das neue Label.
   */
  const updateNodeLabel = (nodeId: string, label: string) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, label } : node))
    );
  };

  // Rückgabe des Hooks: Der Zustand und die Funktionen zur Manipulation.
  return {
    nodes,
    edges,
    addFirstNode,
    addNode,
    toggleStart,
    toggleAccepting,
    addEdge,
    updateEdgeStyle,
    updateEdgeLabel,
    updateNodeLabel,
  };
};
