import { render, screen, fireEvent } from "@testing-library/react";
import NodeComponent from "../../components/NodeComponent";
import { Node } from "../../types";
import { NODE_RADIUS } from "../../constants";
import '@testing-library/jest-dom'

const nodes: Node[] = [
  { id: "1", gridX: 0, gridY: 0, label: "q0", isStart: true, isAccepting: true },
  { id: "2", gridX: 2, gridY: 3, label: "q1", isStart: false, isAccepting: false },
];

describe("NodeComponent", () => {
    const handleNodeClick = jest.fn();
    const pos = { x: 0, y: 0 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders node with label", () => {
        const { container } = render(
            <svg>
                <NodeComponent
                node={nodes[0]}
                pos={pos}
                selectedNode={null}
                handleNodeClick={handleNodeClick}
                />
            </svg>
        );

        expect(screen.getByText("q0")).toBeInTheDocument();

        const circle = container.querySelector("circle");
        expect(circle).toBeInTheDocument();
        expect(circle?.getAttribute("r")).toBe(NODE_RADIUS.toString());
    });

    it("render start arrow if starting state", () => {
        const { container } = render(
            <svg>
                <NodeComponent
                node={nodes[0]}
                pos={pos}
                selectedNode={null}
                handleNodeClick={handleNodeClick}
                />
            </svg>
        );

        const path = container.querySelector("path");
        expect(path?.getAttribute("marker-end")).toBe("url(#arrowhead)");
    })

    it("don't render start arrow if not starting state", () => {
        const { container } = render(
            <svg>
                <NodeComponent
                node={nodes[1]}
                pos={pos}
                selectedNode={null}
                handleNodeClick={handleNodeClick}
                />
            </svg>
        );

        const path = container.querySelector("path");
        expect(path?.getAttribute("marker-end")).toBe(undefined);
    })

    it("render double circle if accepting state", () => {
        const { container } = render(
            <svg>
                <NodeComponent
                node={nodes[0]}
                pos={pos}
                selectedNode={null}
                handleNodeClick={handleNodeClick}
                />
            </svg>
        );

        const circle = container.querySelectorAll("circle");
        expect(circle.length).toBe(2);
        expect(circle[0].getAttribute("r")).toBe(NODE_RADIUS.toString());
        expect(circle[1].getAttribute("r")).toBe((NODE_RADIUS - 5).toString());
    })

    it("don't render double circle if not accepting state", () => {
        const { container } = render(
            <svg>
                <NodeComponent
                node={nodes[1]}
                pos={pos}
                selectedNode={null}
                handleNodeClick={handleNodeClick}
                />
            </svg>
        );

        const circle = container.querySelectorAll("circle");
        expect(circle.length).toBe(1);
    })

    it("calls handleNodeClick if Node is clicked", () => {
        const { container } = render(
            <svg>
                <NodeComponent
                node={nodes[0]}
                pos={pos}
                selectedNode={null}
                handleNodeClick={handleNodeClick}
                />
            </svg>
        );

        const circle = container.querySelector("circle");
        fireEvent.click(circle!);
        expect(handleNodeClick).toHaveBeenCalledWith(nodes[0].id, expect.anything());
    })
});