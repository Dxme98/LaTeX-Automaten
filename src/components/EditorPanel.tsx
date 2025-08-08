import React from "react";
import { Edge, EdgeStyle, Node } from "../types";

interface EditorPanelProps {
  isAddingEdge: boolean;
  cancelAddEdge: () => void;
  editingEdgeStyle: string | null;
  edges: Edge[];
  updateEdgeStyle: (edgeId: string, styleUpdate: Partial<EdgeStyle>) => void;
  setEditingEdgeStyle: (edgeId: string | null) => void;
  editingLabel: string | null;
  labelInput: string;
  setLabelInput: (value: string) => void;
  saveLabelEdit: () => void;
  cancelLabelEdit: () => void;
  editingNodeLabel: string | null;
  nodeLabelInput: string;
  setNodeLabelInput: (value: string) => void;
  saveNodeLabelEdit: () => void;
  cancelNodeLabelEdit: () => void;
  nodes: Node[];
  tikzCode: string;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  isAddingEdge,
  cancelAddEdge,
  editingEdgeStyle,
  edges,
  updateEdgeStyle,
  setEditingEdgeStyle,
  editingLabel,
  labelInput,
  setLabelInput,
  saveLabelEdit,
  cancelLabelEdit,
  editingNodeLabel,
  nodeLabelInput,
  setNodeLabelInput,
  saveNodeLabelEdit,
  cancelNodeLabelEdit,
  nodes,
  tikzCode,
}) => {
  // Finde die zu bearbeitende Kante
  const edgeToEdit = edges.find((e) => e.id === editingEdgeStyle);

  // Finde den zu bearbeitenden Knoten
  const nodeToEdit = nodes.find((n) => n.id === editingNodeLabel);

  return (
    <div className="w-80 bg-white border border-gray-300 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">TikZ Export</h3>
      <div className="space-y-4">
        {isAddingEdge && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">
              Click on target node to create edge
            </p>
            <button
              onClick={cancelAddEdge}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {editingEdgeStyle && edgeToEdit && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700 mb-2">Edit Edge Style:</p>
            <div className="space-y-3">
              {edgeToEdit.style.isLoop ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Loop Position:
                  </label>
                  <select
                    value={edgeToEdit.style.loopPosition}
                    onChange={(e) =>
                      updateEdgeStyle(edgeToEdit.id, {
                        loopPosition: e.target.value as any,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bend:
                    </label>
                    <select
                      value={edgeToEdit.style.bend}
                      onChange={(e) =>
                        updateEdgeStyle(edgeToEdit.id, {
                          bend: e.target.value as any,
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="none">None</option>
                      <option value="left">Bend Left</option>
                      <option value="right">Bend Right</option>
                    </select>
                  </div>

                  {edgeToEdit.style.bend !== "none" && (
                    <div>
                      <label
                        htmlFor="bendAmountSlider"
                        className="block text-sm font-medium mb-1"
                      >
                        Bend Amount:
                      </label>
                      <div className="flex items-center space-x-3">
                        {/* NEU: Schieberegler (Slider) */}
                        <input
                          id="bendAmountSlider"
                          type="range"
                          min="0"
                          max="100"
                          value={edgeToEdit.style.bendAmount || 30}
                          onChange={(e) => {
                            // Wert aus dem Slider auslesen und als Zahl speichern
                            const value = parseInt(e.target.value, 10);
                            updateEdgeStyle(edgeToEdit.id, {
                              bendAmount: value,
                            });
                          }}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />

                        <span className="font-mono text-sm text-gray-700 bg-gray-100 rounded px-2 py-1">
                          {edgeToEdit.style.bendAmount || 30}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        0-100: Stärke der Biegung (Standard: 30)
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Label Position:
                    </label>
                    <select
                      value={edgeToEdit.style.labelPosition || "above"}
                      onChange={(e) =>
                        updateEdgeStyle(edgeToEdit.id, {
                          labelPosition: e.target.value as any,
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                  </div>
                </>
              )}
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => setEditingEdgeStyle(null)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {editingLabel && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-700 mb-2">Edit Edge Label:</p>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              onKeyPress={(e) => e.key === "Enter" && saveLabelEdit()}
            />
            <div className="mt-2 space-x-2">
              <button
                onClick={saveLabelEdit}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={cancelLabelEdit}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {editingNodeLabel && nodeToEdit && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="text-sm text-purple-700 mb-2">Edit Node Label:</p>
            <input
              type="text"
              value={nodeLabelInput}
              onChange={(e) => setNodeLabelInput(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              onKeyPress={(e) => e.key === "Enter" && saveNodeLabelEdit()}
            />
            <div className="mt-2 space-x-2">
              <button
                onClick={saveNodeLabelEdit}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={cancelNodeLabelEdit}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <textarea
          value={tikzCode}
          readOnly
          className="w-full h-96 p-3 border border-gray-300 rounded text-sm font-mono"
          placeholder="TikZ code will appear here..."
        />
      </div>
    </div>
  );
};

export default EditorPanel;
