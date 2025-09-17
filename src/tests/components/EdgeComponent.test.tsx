import { render, screen, fireEvent } from "@testing-library/react"
import EdgeComponent from "../../components/EdgeComponent"
import { Node, Edge } from "../../types"
import '@testing-library/jest-dom'

const nodes: Node[] = [
  { id: "q0", gridX: 0, gridY: 0, label: "q0", isStart: true, isAccepting: false, },
  { id: "q1", gridX: 100, gridY: 0, label: "q1", isStart: false, isAccepting: false },
];

const edges: Edge[] = [
  { id: "e1", fromNodeId: "q0", toNodeId: "q1", label: "a", style: { bend: "none", bendAmount: 0, labelPosition: "above", isLoop: false, }, },
];

describe("EdgeComponent", () =>{
    const handleEdgeLabelEdit = jest.fn();
    const handleEdgeStyleEdit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders a straight edge with label", () => {
    const { container } = render(
      <svg>
        <EdgeComponent
          edge={edges[0]}
          nodes={[nodes[0], nodes[1]]}
          handleEdgeLabelEdit={handleEdgeLabelEdit}
          handleEdgeStyleEdit={handleEdgeStyleEdit}
        />
      </svg>
    );

    expect(screen.getByText("a")).toBeInTheDocument();
    // Path sollte existieren, wenn Linie gerendert wird
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });

  it("calls handleEdgeLabelEdit when label is clicked", () => {
    render(
      <svg>
        <EdgeComponent
          edge={edges[0]}
          nodes={[nodes[0], nodes[1]]}
          handleEdgeLabelEdit={handleEdgeLabelEdit}
          handleEdgeStyleEdit={handleEdgeStyleEdit}
        />
      </svg>
    );

    fireEvent.click(screen.getByText("a"));
    expect(handleEdgeLabelEdit).toHaveBeenCalledWith("e1");
  });

  it("calls handleEdgeStyleEdit when path is double-clicked", () => {
    const { container } = render(
      <svg>
        <EdgeComponent
          edge={edges[0]}
          nodes={[nodes[0], nodes[1]]}
          handleEdgeLabelEdit={handleEdgeLabelEdit}
          handleEdgeStyleEdit={handleEdgeStyleEdit}
        />
      </svg>
    );

    const path = container.querySelector("path")!;
    fireEvent.doubleClick(path);
    expect(handleEdgeStyleEdit).toHaveBeenCalledWith("e1");
  });

  it("renders a self-loop edge", () => {
  const loopEdge: Edge = {
    ...edges[0],
    toNodeId: "q0",
    style: { ...edges[0].style, isLoop: true, loopPosition: "above" },
  };

  const { container } = render(
    <svg>
      <EdgeComponent
        edge={loopEdge}
        nodes={[nodes[0]]}
        handleEdgeLabelEdit={handleEdgeLabelEdit}
        handleEdgeStyleEdit={handleEdgeStyleEdit}
      />
    </svg>
  );

  const path = container.querySelector("path")!;
  expect(path.getAttribute("d")).toContain("C"); // kubischer bezier
});

  it("renders a curved edge (bend left)", () => {
  const curvedEdge: Edge = {
    ...edges[0],
    style: { ...edges[0].style, isLoop: false, bend: "left", bendAmount: 40 },
  };

  const { container } = render(
    <svg>
      <EdgeComponent
        edge={curvedEdge}
        nodes={[nodes[0], nodes[1]]}
        handleEdgeLabelEdit={handleEdgeLabelEdit}
        handleEdgeStyleEdit={handleEdgeStyleEdit}
      />
    </svg>
  );

  const path = container.querySelector("path")!;
  expect(path.getAttribute("d")).toContain("Q"); // quadratischer bezier
  });
});