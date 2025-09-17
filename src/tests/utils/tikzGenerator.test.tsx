import { generateTikzCode } from "../../utils/tikzGenerator";
import { Node, Edge } from "../../types";
import '@testing-library/jest-dom'

const nodes: Node[] = [
  { id: "q0", label: "q0", gridX: 0, gridY: 0, isStart: true, isAccepting: false },
  { id: "q1", label: "q1", gridX: 2, gridY: 0, isStart: false, isAccepting: false },
];

const edges: Edge[] = [
  { id: "e1", fromNodeId: "q0", toNodeId: "q1", label: "a", style: { bend: "left", bendAmount: 50, labelPosition: "above", isLoop: false } }
];

describe("generateTikzCode", () => {
  it("generates correct TikZ nodes and edges", () => {
    const tikz = generateTikzCode(nodes, edges);

    expect(tikz).toContain(`\\begin{tikzpicture}[shorten >=1pt,node distance=2cm,on grid,auto]
  \\node[state,initial] (q0) {$q0$};
  \\node[state] (q1) [right=of q0] {$q1$};

  \\draw
    (q0) edge[bend left=50] node{a} (q1);
\\end{tikzpicture}`,);
  });
});