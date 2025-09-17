import { render, screen, fireEvent, getByDisplayValue } from "@testing-library/react"
import EditorPanel from "../../components/EditorPanel"
import { Node, Edge } from "../../types"
import '@testing-library/jest-dom'

const nodes: Node[] = [
  { id: "q0", gridX: 0, gridY: 0, label: "q0", isStart: true, isAccepting: false, },
  { id: "q1", gridX: 100, gridY: 0, label: "q1", isStart: false, isAccepting: false },
];

const edges: Edge[] = [
  { id: "e1", fromNodeId: "q0", toNodeId: "q1", label: "a", style: { bend: "none", bendAmount: 0, labelPosition: "above", isLoop: false, }, },
  { id: "e2", fromNodeId: "q0", toNodeId: "q0", label: "b", style: { bend: "none", bendAmount: 0, labelPosition: "above", isLoop: true, loopPosition: "above", }, },
];

const props = {
  isAddingEdge: false,
  cancelAddEdge: jest.fn(),
  editingEdgeStyle: "",
  edges: [edges[0], edges[1]],
  updateEdgeStyle: jest.fn(),
  setEditingEdgeStyle: jest.fn(),
  editingLabel: null,
  labelInput: "",
  setLabelInput: jest.fn(),
  saveLabelEdit: jest.fn(),
  cancelLabelEdit: jest.fn(),
  editingNodeLabel: null,
  nodeLabelInput: "",
  setNodeLabelInput: jest.fn(),
  saveNodeLabelEdit: jest.fn(),
  cancelNodeLabelEdit: jest.fn(),
  nodes: [nodes[0], nodes[1]],
  tikzCode: `\\begin{tikzpicture}[shorten >=1pt,node distance=2cm,on grid,auto]
  \\node[state,initial] (q0) {$q0$};
  \\node[state] (q1) [right=of q0] {$q1$};

  \\draw
    (q0) edge node{a} (q1)
    (q0) edge[loop above] node{b} (q0);
\\end{tikzpicture}`,
};

describe("EditorPanel", () =>{
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders TikZ export section with textarea", () => {
        render(<EditorPanel {...props} />);
        expect(screen.getByText("TikZ Export")).toBeInTheDocument();
        expect(screen.getByText("Copy TikZ Code")).toBeInTheDocument();
    
        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveValue(props.tikzCode);
    });

    it("renders Add Edge info box if isAddingEdge is true", () => {
        render(<EditorPanel {...props} isAddingEdge={true} />);
         expect(screen.getByText("Click on target node to create edge")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Cancel"));
        expect(props.cancelAddEdge).toHaveBeenCalled();
    });

    it("render Edge Style Editor for Bend", () => {
        render(<EditorPanel {...props} editingEdgeStyle={"e1"} edges={[edges[0]]} />);
        expect(screen.getByText("Edit Edge Style:"));
        expect(screen.getByText("Bend:"));

        const bendSelect = screen.getByDisplayValue("None");
        expect(bendSelect).toBeInTheDocument();

        fireEvent.change(bendSelect, { target: { value: "left" } });
        expect(props.updateEdgeStyle).toHaveBeenCalledWith("e1", { bend: "left" });
    })

    it("render Edge Style Editor for Loop", () => {
        render(<EditorPanel {...props} editingEdgeStyle={"e2"} edges={[edges[1]]} />);
        expect(screen.getByText("Loop Position:"));

        const loopSelect = screen.getByDisplayValue("Above");
        expect(loopSelect).toBeInTheDocument();

        fireEvent.change(loopSelect, { target: { value: "below" } });
        expect(props.updateEdgeStyle).toHaveBeenCalledWith("e2", { loopPosition: "below" });
    })

    it("render Edge label Editor", () => {
        render(<EditorPanel {...props} editingLabel={"e1"} labelInput="a" />);
        expect(screen.getByText("Edit Edge Label:"));

        const edgeLabel = screen.getByDisplayValue("a");
        fireEvent.change(edgeLabel, { target: { value: "b"}})
        expect(props.setLabelInput).toHaveBeenCalledWith("b")

        fireEvent.click(screen.getByText("Save"))
        expect(props.saveLabelEdit).toHaveBeenCalled();

        fireEvent.click(screen.getByText("Cancel"))
        expect(props.cancelLabelEdit).toHaveBeenCalled();
    })

    it("render Node label Editor", () => {
        render(<EditorPanel {...props} editingNodeLabel={"q0"} nodeLabelInput="q0" />);
        expect(screen.getByText("Edit Node Label:"));

        const nodeLabel = screen.getByDisplayValue("q0");
        fireEvent.change(nodeLabel, { target: { value: "Node1"}})
        expect(props.setNodeLabelInput).toHaveBeenCalledWith("Node1")

        fireEvent.click(screen.getByText("Save"))
        expect(props.saveNodeLabelEdit).toHaveBeenCalled();

        fireEvent.click(screen.getByText("Cancel"))
        expect(props.cancelNodeLabelEdit).toHaveBeenCalled();
    })
});