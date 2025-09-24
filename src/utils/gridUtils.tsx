import { Node } from "../types";
import { GRID_SIZE } from "../constants";

/**
 * Berechnet die Grenzen des Grids basierend auf den Positionen aller Knoten.
 * Das Ergebnis ist ein Bounding-Box-Objekt, das um einen Puffer erweitert wird,
 * damit das Grid und die Knoten nicht direkt am Rand des Canvas kleben.
 * @param {Node[]} nodes - Eine Liste aller Knoten im Automaten.
 * @returns {{minX: number, maxX: number, minY: number, maxY: number}} Ein Objekt mit den minimalen und maximalen Grid-Koordinaten.
 */
export const getGridBounds = (nodes: Node[]) => {
  if (nodes.length === 0) return { minX: -2, maxX: 2, minY: -2, maxY: 2 };

  // Finde die äußersten X- und Y-Koordinaten aller Knoten.
  // Der Puffer von `- 2` und `+ 2` sorgt für zusätzlichen Platz um die äußersten Knoten.
  const minX = Math.min(...nodes.map((n) => n.gridX)) - 2;
  const maxX = Math.max(...nodes.map((n) => n.gridX)) + 2;
  const minY = Math.min(...nodes.map((n) => n.gridY)) - 2;
  const maxY = Math.max(...nodes.map((n) => n.gridY)) + 2;

  return { minX, maxX, minY, maxY };
};

/**
 * Wandelt relative Grid-Koordinaten in absolute Pixel-Koordinaten für die SVG-Darstellung um.
 * Die Berechnung berücksichtigt die dynamischen Grenzen des Grids, sodass der
 * Knoten mit den kleinsten Koordinaten (minX, minY) nahe am Pixel-Ursprung (0,0) des SVGs liegt.
 * @param {{x: number, y: number}} gridPos - Die zu konvertierende Grid-Position.
 * @param {Node[]} nodes - Die Liste aller Knoten, benötigt zur Berechnung der Grid-Grenzen.
 * @returns {{x: number, y: number}} Die entsprechende Position in Pixeln.
 */
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

/**
 * Wandelt absolute Pixel-Koordinaten (z.B. von einem Mausklick) in die nächstgelegenen relativen Grid-Koordinaten um.
 * Diese Funktion ist die Umkehrung von `gridToPixel`.
 * @param {{x: number, y: number}} pixelPos - Die zu konvertierende Pixel-Position.
 * @param {Node[]} nodes - Die Liste aller Knoten, benötigt zur Berechnung der Grid-Grenzen.
 * @returns {{x: number, y: number}} Die entsprechende Position auf dem Grid.
 */
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
