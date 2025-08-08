import React from "react";
import { Node } from "../types";

interface ContextMenuProps {
  pos: { x: number; y: number };
  selectedNode: string;
  nodes: Node[];
  addNode: (direction: "right" | "left" | "up" | "down") => void;
  toggleStart: () => void;
  toggleAccepting: () => void;
  startAddingEdge: () => void;
  startEditingNodeLabel: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  pos,
  selectedNode,
  nodes,
  addNode,
  toggleStart,
  toggleAccepting,
  startAddingEdge,
  startEditingNodeLabel,
}) => {
  // Finde die Daten des aktuell ausgewählten Knotens
  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  // CSS-Stilobjekt für die absolute Positionierung des Menüs.
  const menuStyle: React.CSSProperties = {
    position: "absolute",
    top: `${pos.y}px`,
    left: `${pos.x}px`,
    zIndex: 10, // Stellt sicher, dass das Menü über anderen Elementen liegt
  };

  return (
    // Das Haupt-div wird mit dem berechneten Stil positioniert.
    <div style={menuStyle}>
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-52">
        <div className="space-y-2">
          <button
            onClick={() => addNode("right")}
            className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded"
          >
            Add Node Right
          </button>
          <button
            onClick={() => addNode("left")}
            className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded"
          >
            Add Node Left
          </button>
          <button
            onClick={() => addNode("up")}
            className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded"
          >
            Add Node Above
          </button>
          <button
            onClick={() => addNode("down")}
            className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded"
          >
            Add Node Below
          </button>
          <hr />
          <button
            onClick={toggleStart}
            className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded"
          >
            {selectedNodeData?.isStart ? "Remove" : "Set"} Start State
          </button>
          <button
            onClick={toggleAccepting}
            className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded"
          >
            {selectedNodeData?.isAccepting ? "Remove" : "Set"} Accepting State
          </button>
          <button
            onClick={startEditingNodeLabel}
            className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded"
          >
            Change Label Name
          </button>
          <hr />
          <button
            onClick={startAddingEdge}
            className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded"
          >
            Add Edge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
