import "./App.css";
import React, { useState, useRef } from "react";
import { useAutomaton } from "./hooks/useAutomaton";
import { getGridBounds, gridToPixel } from "./utils/gridUtils";
import { GRID_SIZE } from "./constants";
import { generateTikzCode } from "./utils/tikzGenerator";

import Grid from "./components/Grid";
import NodeComponent from "./components/NodeComponent";
import EdgeComponent from "./components/EdgeComponent";
import ContextMenu from "./components/ContextMenu";
import EditorPanel from "./components/EditorPanel";

// Hauptkomponente der Anwendung
export default function AutomatonEditor() {
  // Hier wird der Custom Hook aufgerufen. Er liefert uns den Zustand (nodes, edges)
  // und alle Funktionen, um diesen Zustand zu verändern.
  const {
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
    clearAutomaton,
    undoLastAction,
    canUndo,
  } = useAutomaton();

  const [showGrid, setShowGrid] = useState(true);

  // UI-Zustand, der nur für die Darstellung relevant ist
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [editingEdgeStyle, setEditingEdgeStyle] = useState<string | null>(null);
  const [isAddingEdge, setIsAddingEdge] = useState(false);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [editingNodeLabel, setEditingNodeLabel] = useState<string | null>(null);
  const [nodeLabelInput, setNodeLabelInput] = useState("");

  // Ref um das ContextMenu korrekt platzieren
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Berechnet die dynamische Größe des SVG-Canvas basierend auf der Position der Knoten
  const bounds = getGridBounds(nodes);
  const svgWidth = (bounds.maxX - bounds.minX) * GRID_SIZE;
  const svgHeight = (bounds.maxY - bounds.minY) * GRID_SIZE;

  /**
   * Behandelt Klicks auf einen Knoten
   * @param nodeId Die ID des geklickten Knotens
   * @param event Das Maus-Klick-Event
   */
  const handleNodeClick = (nodeId: string, event: React.MouseEvent) => {
    // Verhindert, dass das ContextMenu direkt wieder geschlossen wird
    event.stopPropagation();

    //  Wenn wir gerade eine Kante hinzufügen
    if (isAddingEdge) {
      if (edgeStart) {
        addEdge(edgeStart, nodeId);
        setIsAddingEdge(false);
        setEdgeStart(null);
      }
      //  Normaler Klick, um das Kontextmenü zu öffnen
    } else {
      setSelectedNode(nodeId);
      // Position des ContextMenu relativ zum Canvas-Container berechnen
      const rect = canvasContainerRef.current?.getBoundingClientRect();
      if (rect) {
        let menuX = event.clientX - rect.left;
        let menuY = event.clientY - rect.top;
        setContextMenuPos({ x: menuX, y: menuY });
        setShowContextMenu(true);
      }
    }
  };

  /**
   * Startet den Prozess zum Hinzufügen einer Kante.
   */
  const startAddingEdge = () => {
    setIsAddingEdge(true);
    setEdgeStart(selectedNode);
    setShowContextMenu(false);
  };

  /** Schließe Menu sobald Node geadded wird */
  const handleAddNode = (direction: "right" | "left" | "up" | "down") => {
    addNode(direction, selectedNode);
    setShowContextMenu(false);
  };

  const handleToggleStart = () => toggleStart(selectedNode);
  const handleToggleAccepting = () => toggleAccepting(selectedNode);

  /**
   * Bereitet die Bearbeitung eines Kanten-Labels vor.
   * @param edgeId Die ID der Kante.
   */
  const handleEdgeLabelEdit = (edgeId: string) => {
    setEditingLabel(edgeId);
    const edge = edges.find((e) => e.id === edgeId);
    setLabelInput(edge?.label || "");
  };

  /**
   * Speichert das bearbeitete Kanten-Label
   */
  const saveLabelEdit = () => {
    if (editingLabel) {
      updateEdgeLabel(editingLabel, labelInput);
      setEditingLabel(null);
      setLabelInput("");
    }
  };

  /**
   * Bricht die Bearbeitung des Labels ab
   */
  const cancelLabelEdit = () => {
    setEditingLabel(null);
    setLabelInput("");
  };

  /**
   * Öffnet den Dialog zur Bearbeitung des Kantenstils
   * @param edgeId Die ID der Kante
   */
  const handleEdgeStyleEdit = (edgeId: string) => {
    setEditingEdgeStyle(edgeId);
  };

  /**
   * Startet die Bearbeitung eines Knoten-Labels
   */
  const startEditingNodeLabel = () => {
    if (selectedNode) {
      setEditingNodeLabel(selectedNode);
      const node = nodes.find((n) => n.id === selectedNode);
      setNodeLabelInput(node?.label || "");
      setShowContextMenu(false);
    }
  };

  /**
   * Speichert das bearbeitete Knoten-Label
   */
  const saveNodeLabelEdit = () => {
    if (editingNodeLabel) {
      updateNodeLabel(editingNodeLabel, nodeLabelInput);
      setEditingNodeLabel(null);
      setNodeLabelInput("");
    }
  };

  /**
   * Bricht die Bearbeitung des Knoten-Labels ab
   */
  const cancelNodeLabelEdit = () => {
    setEditingNodeLabel(null);
    setNodeLabelInput("");
  };

  const handleClearCanvas = () => {
    clearAutomaton();
  };

  /**
   * Behandelt den Back-Button Klick
   */
  const handleBackClick = () => {
    undoLastAction();
    // Schließe alle offenen Dialoge beim Zurückgehen
    setShowContextMenu(false);
    setSelectedNode(null);
    setEditingEdgeStyle(null);
    setEditingLabel(null);
    setEditingNodeLabel(null);
    setIsAddingEdge(false);
    setEdgeStart(null);
  };

  // Generiert den TikZ-Code bei jedem Render-Vorgang neu
  const tikzCode = generateTikzCode(nodes, edges);

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <div className="flex gap-4 h-full">
        <div className="flex-1 flex flex-col gap-2">
          {/* --- Toolbar für QoL-Features --- */}
          <div className="bg-white border border-gray-300 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label
                htmlFor="showGrid"
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="showGrid"
                  checked={showGrid}
                  onChange={() => setShowGrid(!showGrid)}
                  className="rounded"
                />
                Show Grid
              </label>
              <button
                onClick={handleBackClick}
                disabled={!canUndo}
                title="Undo last action (Back)"
                className={`px-3 py-2 text-white rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  canUndo
                    ? "bg-orange-500 hover:bg-orange-600 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Undo
              </button>
            </div>
            <button
              onClick={handleClearCanvas}
              title="Clear Canvas"
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 text-sm"
            >
              Clear Canvas
            </button>
          </div>

          {/* Dieser Container ist der Positionierungsanker für das Kontextmenü (`relative`) */}
          <div
            ref={canvasContainerRef}
            className="flex-1 bg-white border border-gray-300 rounded-lg overflow-auto relative"
            onClick={() => {
              setShowContextMenu(false);
              setSelectedNode(null);
            }}
          >
            {/* Bedingtes Rendering: Zeige "Add First Node"-Button, wenn keine Knoten da sind. */}
            {nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <button
                  onClick={addFirstNode}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add First Node
                </button>
              </div>
            ) : (
              <>
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  className="cursor-crosshair"
                >
                  {/* Definitionen für wiederverwendbare SVG-Elemente. */}
                  <defs>
                    {/* Definiert eine Pfeilspitze, die von Kanten über ihre ID arrowhead verwendet werden kann. */}
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                      fill="black"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" />
                    </marker>
                  </defs>
                  {/* --- Grid wird nur bei Bedarf gerendert --- */}
                  {showGrid && <Grid nodes={nodes} />}
                  {/* Wir mappen über die `edges`- und `nodes`-Arrays aus dem State... */}
                  {edges.map((edge) => (
                    <EdgeComponent
                      key={edge.id}
                      edge={edge}
                      nodes={nodes}
                      handleEdgeLabelEdit={handleEdgeLabelEdit}
                      handleEdgeStyleEdit={handleEdgeStyleEdit}
                    />
                  ))}
                  {nodes.map((node) => (
                    <NodeComponent
                      key={node.id}
                      node={node}
                      pos={gridToPixel({ x: node.gridX, y: node.gridY }, nodes)}
                      selectedNode={selectedNode}
                      handleNodeClick={handleNodeClick}
                    />
                  ))}
                </svg>

                {/* ContextMenu wird HIER gerendert, außerhalb des SVGs aber innerhalb des relativen Containers */}
                {showContextMenu && selectedNode && (
                  <ContextMenu
                    pos={contextMenuPos}
                    nodes={nodes}
                    selectedNode={selectedNode}
                    addNode={handleAddNode}
                    toggleStart={handleToggleStart}
                    toggleAccepting={handleToggleAccepting}
                    startAddingEdge={startAddingEdge}
                    startEditingNodeLabel={startEditingNodeLabel}
                  />
                )}
              </>
            )}
          </div>
        </div>
        {/* Das Panel auf der rechten Seite. */}
        <EditorPanel
          isAddingEdge={isAddingEdge}
          cancelAddEdge={() => {
            setIsAddingEdge(false);
            setEdgeStart(null);
          }}
          editingEdgeStyle={editingEdgeStyle}
          edges={edges}
          updateEdgeStyle={updateEdgeStyle}
          setEditingEdgeStyle={setEditingEdgeStyle}
          editingLabel={editingLabel}
          labelInput={labelInput}
          setLabelInput={setLabelInput}
          saveLabelEdit={saveLabelEdit}
          cancelLabelEdit={cancelLabelEdit}
          editingNodeLabel={editingNodeLabel}
          nodeLabelInput={nodeLabelInput}
          setNodeLabelInput={setNodeLabelInput}
          saveNodeLabelEdit={saveNodeLabelEdit}
          cancelNodeLabelEdit={cancelNodeLabelEdit}
          nodes={nodes}
          tikzCode={tikzCode}
        />
      </div>
    </div>
  );
}
