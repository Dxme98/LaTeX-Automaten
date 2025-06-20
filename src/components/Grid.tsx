import React from "react";
import { getGridBounds } from "../utils/gridUtils";
import { GRID_SIZE } from "../constants";
import { Node } from "../types";

interface GridProps {
  nodes: Node[];
}

const Grid: React.FC<GridProps> = ({ nodes }) => {
  // Berechne die äußersten Grenzen des Gitters
  const bounds = getGridBounds(nodes);
  const lines = [];

  // Schleife zum Zeichnen der vertikalen Linien
  for (let x = bounds.minX; x <= bounds.maxX; x++) {
    // Berechne die x-Position in Pixeln relativ zum linken Rand
    const pixelX = (x - bounds.minX) * GRID_SIZE;
    lines.push(
      <line
        key={`v${x}`} // Einzigartiger Schlüssel für React
        x1={pixelX} // Startpunkt x (oben)
        y1={0} // Startpunkt y (oben)
        x2={pixelX} // Endpunkt x (unten, gleiche x-Position)
        y2={(bounds.maxY - bounds.minY) * GRID_SIZE} // Höhe des Grids in Pixeln
        stroke="#e0e0e0" // Farbe der Linie (hellgrau)
        strokeWidth="1" // Liniendicke
      />
    );
  }

  // Schleife zum Zeichnen der horizontalen Linien
  for (let y = bounds.minY; y <= bounds.maxY; y++) {
    const pixelY = (y - bounds.minY) * GRID_SIZE;
    lines.push(
      <line
        key={`h${y}`}
        x1={0}
        y1={pixelY}
        x2={(bounds.maxX - bounds.minX) * GRID_SIZE}
        y2={pixelY}
        stroke="#e0e0e0"
        strokeWidth="1"
      />
    );
  }

  // Gib das Array der Linien-Elemente zurück, die von React gerendert werden.
  return <>{lines}</>;
};

export default Grid;
