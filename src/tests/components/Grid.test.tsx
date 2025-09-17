import { render } from "@testing-library/react";
import Grid from "../../components/Grid";
import { Node } from "../../types";
import { GRID_SIZE } from "../../constants";
import { getGridBounds } from "../../utils/gridUtils";
import '@testing-library/jest-dom'

const nodes: Node[] = [
    { id: "q0", gridX: 0, gridY: 0, label: "q0", isStart: false, isAccepting: false },
  ];

jest.mock("../../utils/gridUtils", () => ({
  getGridBounds: jest.fn(),
}));

describe("Grid", () => {

    beforeEach(() => {
    (getGridBounds as jest.Mock).mockReturnValue({
      minX: -2,
      maxX: 2,
      minY: -2,
      maxY: 2,
    });
    });

    it("renders the correct number of grid lines", () => {
    const { container } = render(<svg><Grid nodes={nodes} /></svg>);

    const lines = container.querySelectorAll("line");
    
    expect(lines).toHaveLength(10); 
  });

  it("berechnet die richtigen Pixel-Positionen", () => {
    const { container } = render(<svg><Grid nodes={nodes} /></svg>);
    const lines = container.querySelectorAll("line");

    // Vertikale Linien prüfen
    expect(lines[0]).toHaveAttribute("x1", "0");
    expect(lines[1]).toHaveAttribute("x1", `${1 * GRID_SIZE}`);
    expect(lines[2]).toHaveAttribute("x1", `${2 * GRID_SIZE}`);
    expect(lines[3]).toHaveAttribute("x1", `${3 * GRID_SIZE}`);
    expect(lines[4]).toHaveAttribute("x1", `${4 * GRID_SIZE}`);

    // Horizontale Linien prüfen
    expect(lines[5]).toHaveAttribute("y1", "0");
    expect(lines[6]).toHaveAttribute("y1", `${1 * GRID_SIZE}`);
    expect(lines[7]).toHaveAttribute("y1", `${2 * GRID_SIZE}`);
    expect(lines[8]).toHaveAttribute("y1", `${3 * GRID_SIZE}`);
    expect(lines[9]).toHaveAttribute("y1", `${4 * GRID_SIZE}`);
  });
})