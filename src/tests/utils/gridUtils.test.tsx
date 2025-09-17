import { getGridBounds, gridToPixel, pixelToGrid } from "../../utils/gridUtils";
import { Node } from "../../types";
import { GRID_SIZE } from "../../constants";
import '@testing-library/jest-dom'

const nodes: Node[] = [
  { id: "q0", gridX: 0, gridY: 0, label: "q0", isStart: true, isAccepting: false },
  { id: "q1", gridX: 2, gridY: 0, label: "q1", isStart: false, isAccepting: false },
];

describe("gridUtils", () => {
  it("calculates grid bounds correctly", () => {
    expect(getGridBounds(nodes)).toEqual({
      minX: -2,
      maxX: 4,
      minY: -2,
      maxY: 2,
    });
  });

  it("converts grid to pixel correctly", () => {
    const pixel = gridToPixel({ x: 2, y: 0}, nodes);

    expect(pixel).toEqual({
        x: (2 - (-2)) * GRID_SIZE,
        y: (0 - (-2)) * GRID_SIZE,
    });
  });

  it("converts pixel to grid correctly", () => {
    const grid = pixelToGrid({x: (2 - (-2)) * GRID_SIZE, y: (0 - (-2)) * GRID_SIZE}, nodes);
    expect(grid).toEqual({x: 2, y: 0});
  });
});