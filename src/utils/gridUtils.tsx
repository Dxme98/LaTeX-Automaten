import { Node } from "../types";
import { GRID_SIZE } from "../constants";

export const getGridBounds = (nodes: Node[]) => {
  if (nodes.length === 0) return { minX: -2, maxX: 2, minY: -2, maxY: 2 };

  // Minimal und Maximal X und Y Koordinaten um das Grid korrekt darzustellen
  const minX = Math.min(...nodes.map((n) => n.gridX)) - 2;
  const maxX = Math.max(...nodes.map((n) => n.gridX)) + 2;
  const minY = Math.min(...nodes.map((n) => n.gridY)) - 2;
  const maxY = Math.max(...nodes.map((n) => n.gridY)) + 2;

  return { minX, maxX, minY, maxY };
};

// Wandle grid position in absolute pixel positonen um
export const gridToPixel = (
  gridPos: { x: number; y: number },
  nodes: Node[]
) => {
  const bounds = getGridBounds(nodes);
  return {
    x: (gridPos.x - bounds.minX) * GRID_SIZE,
    y: (gridPos.y - bounds.minY) * GRID_SIZE,
  };
};

export const pixelToGrid = (
  pixelPos: { x: number; y: number },
  nodes: Node[]
) => {
  const bounds = getGridBounds(nodes);
  return {
    x: Math.round(pixelPos.x / GRID_SIZE) + bounds.minX,
    y: Math.round(pixelPos.y / GRID_SIZE) + bounds.minY,
  };
};
