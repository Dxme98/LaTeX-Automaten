import React from "react";
import { Node } from "../types";
import { NODE_RADIUS } from "../constants";

interface NodeComponentProps {
  node: Node;
  pos: { x: number; y: number };
  selectedNode: string | null;
  handleNodeClick: (nodeId: string, event: React.MouseEvent) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  pos,
  selectedNode,
  handleNodeClick,
}) => {
  return (
    <g key={node.id}>
      {/* Start arrow */}
      {node.isStart && (
        <path
          d={`M ${pos.x - NODE_RADIUS - 20} ${pos.y} L ${
            pos.x - NODE_RADIUS - 5
          } ${pos.y}`}
          stroke="black"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      )}

      {/* Node circle */}
      <circle
        data-testid={`node-${node.id}`}
        cx={pos.x}
        cy={pos.y}
        r={NODE_RADIUS}
        fill={selectedNode === node.id ? "#e3f2fd" : "white"}
        stroke="black"
        strokeWidth="2"
        onClick={(e) => handleNodeClick(node.id, e)}
        style={{ cursor: "pointer" }}
      />

      {/* Accepting state (double circle) */}
      {node.isAccepting && (
        <circle
          cx={pos.x}
          cy={pos.y}
          r={NODE_RADIUS - 5}
          fill="none"
          stroke="black"
          strokeWidth="2"
          pointerEvents="none"
        />
      )}

      {/* Node label */}
      <text
        x={pos.x}
        y={pos.y + 5}
        textAnchor="middle"
        fontSize="14"
        pointerEvents="none"
      >
        {node.label}
      </text>
    </g>
  );
};

export default NodeComponent;
