import React from "react";
import { Edge, Node } from "../types";
import { gridToPixel } from "../utils/gridUtils";
import { NODE_RADIUS } from "../constants";

interface EdgeComponentProps {
  edge: Edge;
  nodes: Node[];
  handleEdgeLabelEdit: (edgeId: string) => void;
  handleEdgeStyleEdit: (edgeId: string) => void;
}

/**
 * Hilfsfunktion, um den Punkt auf der Kreislinie eines Knotens zu berechnen
 * an dem die Kante enden soll, damit sie nicht in den Knoten hineinragt
 * @param fromPos Die Position des Startpunkts der Linie (der Mittelpunkt des anderen Knotens)
 * @param toPos Die Position des Zielpunkts der Linie (der Mittelpunkt des Zielknotens)
 * @param nodeRadius Der Radius des Zielknotens
 * @returns Die Koordinate auf der Kreislinie
 */
const calculateArrowPosition = (
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  nodeRadius: number
) => {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return toPos;

  // Berechnet den Punkt auf der Linie, der um `nodeRadius` vom Mittelpunkt entfernt ist.
  const ratio = (distance - nodeRadius) / distance;
  return {
    x: fromPos.x + dx * ratio,
    y: fromPos.y + dy * ratio,
  };
};

const EdgeComponent: React.FC<EdgeComponentProps> = ({
  edge,
  nodes,
  handleEdgeLabelEdit,
  handleEdgeStyleEdit,
}) => {
  // Finde die vollständigen Knoten-Objekte anhand der IDs in der Kante.
  const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
  const toNode = nodes.find((n) => n.id === edge.toNodeId);

  // Rendere nichts, wenn ein Knoten nicht gefunden wird.
  if (!fromNode || !toNode) return null;

  const fromPos = gridToPixel({ x: fromNode.gridX, y: fromNode.gridY }, nodes);
  const toPos = gridToPixel({ x: toNode.gridX, y: toNode.gridY }, nodes);

  // Rendering von Schleifen (Self-Loops)
  if (edge.style.isLoop) {
    const loopRadius = 35;
    const spacing = 15;
    let pathData = "";
    let labelX = fromPos.x;
    let labelY = fromPos.y;

    switch (edge.style.loopPosition) {
      case "above":
        const startX = fromPos.x - 8;
        const startY = fromPos.y - NODE_RADIUS;
        const endX = fromPos.x + 8;
        const endY = fromPos.y - NODE_RADIUS;
        pathData = `M ${startX} ${startY} C ${startX - loopRadius} ${
          startY - spacing - loopRadius * 0.8
        }, ${endX + loopRadius} ${
          endY - spacing - loopRadius * 0.8
        }, ${endX} ${endY}`;
        labelX = fromPos.x;
        labelY = fromPos.y - NODE_RADIUS - spacing - loopRadius * 0.7;
        break;
      case "below":
        const startXB = fromPos.x - 8;
        const startYB = fromPos.y + NODE_RADIUS;
        const endXB = fromPos.x + 8;
        const endYB = fromPos.y + NODE_RADIUS;
        pathData = `M ${startXB} ${startYB} C ${startXB - loopRadius} ${
          startYB + spacing + loopRadius * 0.8
        }, ${endXB + loopRadius} ${
          endYB + spacing + loopRadius * 0.8
        }, ${endXB} ${endYB}`;
        labelX = fromPos.x;
        labelY = fromPos.y + NODE_RADIUS + spacing + loopRadius * 0.6;
        break;
      case "left":
        const startXL = fromPos.x - NODE_RADIUS;
        const startYL = fromPos.y - 8;
        const endXL = fromPos.x - NODE_RADIUS;
        const endYL = fromPos.y + 8;
        pathData = `M ${startXL} ${startYL} C ${
          startXL - spacing - loopRadius * 0.8
        } ${startYL - loopRadius}, ${endXL - spacing - loopRadius * 0.8} ${
          endYL + loopRadius
        }, ${endXL} ${endYL}`;
        labelX = fromPos.x - NODE_RADIUS - spacing - loopRadius * 0.6;
        labelY = fromPos.y;
        break;
      case "right":
        const startXR = fromPos.x + NODE_RADIUS;
        const startYR = fromPos.y - 8;
        const endXR = fromPos.x + NODE_RADIUS;
        const endYR = fromPos.y + 8;
        pathData = `M ${startXR} ${startYR} C ${
          startXR + spacing + loopRadius * 0.8
        } ${startYR - loopRadius}, ${endXR + spacing + loopRadius * 0.8} ${
          endYR + loopRadius
        }, ${endXR} ${endYR}`;
        labelX = fromPos.x + NODE_RADIUS + spacing + loopRadius * 0.6;
        labelY = fromPos.y;
        break;
    }

    return (
      <g key={edge.id}>
        <path
          d={pathData}
          fill="none"
          stroke="black"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          onDoubleClick={() => handleEdgeStyleEdit(edge.id)}
          style={{ cursor: "pointer" }}
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="14"
          onClick={() => handleEdgeLabelEdit(edge.id)}
          style={{ cursor: "pointer" }}
        >
          {edge.label}
        </text>
      </g>
    );
  }

  // --- Rendering für normale Kanten (gerade oder gebogen) ---
  const edgeStartPos = calculateArrowPosition(toPos, fromPos, NODE_RADIUS);
  const edgeEndPos = calculateArrowPosition(fromPos, toPos, NODE_RADIUS);

  let pathData;
  let labelPos;

  // Wenn keine Biegung eingestellt ist, zeichne eine gerade Linie
  if (edge.style.bend === "none") {
    pathData = `M ${edgeStartPos.x} ${edgeStartPos.y} L ${edgeEndPos.x} ${edgeEndPos.y}`;
    labelPos = {
      x: (edgeStartPos.x + edgeEndPos.x) / 2,
      y: (edgeStartPos.y + edgeEndPos.y) / 2,
    };
  } else {
    // Rendering von gebogenen Kanten
    const midX = (edgeStartPos.x + edgeEndPos.x) / 2;
    const midY = (edgeStartPos.y + edgeEndPos.y) / 2;
    const dx = edgeEndPos.x - edgeStartPos.x;
    const dy = edgeEndPos.y - edgeStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const bendAmount = edge.style.bendAmount || 30;
    const bendOffset = (distance * bendAmount) / 100;
    let controlX, controlY;

    if (edge.style.bend === "left") {
      controlX = midX + (dy / distance) * bendOffset;
      controlY = midY - (dx / distance) * bendOffset;
    } else {
      controlX = midX - (dy / distance) * bendOffset;
      controlY = midY + (dx / distance) * bendOffset;
    }
    pathData = `M ${edgeStartPos.x} ${edgeStartPos.y} Q ${controlX} ${controlY} ${edgeEndPos.x} ${edgeEndPos.y}`;

    // Das Label wird am Scheitelpunkt der Bézier-Kurve platziert (bei t=0.5)
    labelPos = {
      x: 0.25 * edgeStartPos.x + 0.5 * controlX + 0.25 * edgeEndPos.x,
      y: 0.25 * edgeStartPos.y + 0.5 * controlY + 0.25 * edgeEndPos.y,
    };
  }

  const labelOffset = 15;
  if (edge.style.labelPosition) {
    const dx = edgeEndPos.x - edgeStartPos.x;
    const dy = edgeEndPos.y - edgeStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Normalisierter Vektor senkrecht zur Kante
      const nx = -dy / distance;
      const ny = dx / distance;

      switch (edge.style.labelPosition) {
        case "above":
          //  case "left":
          labelPos.x -= nx * labelOffset;
          labelPos.y -= ny * labelOffset;
          break;
        case "below":
          //   case "right":
          labelPos.x += nx * labelOffset;
          labelPos.y += ny * labelOffset;
          break;
      }
    }
  }

  return (
    <g key={edge.id}>
      <path
        d={pathData}
        fill="none"
        stroke="black"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        onDoubleClick={() => handleEdgeStyleEdit(edge.id)}
        style={{ cursor: "pointer" }}
      />
      <text
        x={labelPos.x}
        y={labelPos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        onClick={() => handleEdgeLabelEdit(edge.id)}
        style={{ cursor: "pointer" }}
        fill="black"
      >
        {edge.label}
      </text>
    </g>
  );
};

export default EdgeComponent;
