import { render, screen, fireEvent } from "@testing-library/react"
import ContextMenu from "../../components/ContextMenu"
import { Node } from "../../types"
import '@testing-library/jest-dom'


const nodes: Node[] = [
  { id: "q0", gridX: 0, gridY: 0, label: "q0", isStart: false, isAccepting: false, },
];

const props = {
  pos: { x: 100, y: 200 },
  selectedNode: "q0",
  nodes: [nodes[0]],
  addNode: jest.fn(),
  toggleStart: jest.fn(),
  toggleAccepting: jest.fn(),
  startAddingEdge: jest.fn(),
  startEditingNodeLabel: jest.fn(),
};

describe("ContextMenu", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all action buttons", () => {
    render(<ContextMenu {...props} />);
    expect(screen.getByText("Add Node Right")).toBeInTheDocument();
    expect(screen.getByText("Add Node Left")).toBeInTheDocument();
    expect(screen.getByText("Add Node Above")).toBeInTheDocument();
    expect(screen.getByText("Add Node Below")).toBeInTheDocument();
    expect(screen.getByText("Set Start State")).toBeInTheDocument();
    expect(screen.getByText("Set Accepting State")).toBeInTheDocument();
    expect(screen.getByText("Change Label Name")).toBeInTheDocument();
    expect(screen.getByText("Add Edge")).toBeInTheDocument();
  });

  it("calls addNode with correct direction", () => {
    render(<ContextMenu {...props} />);
    fireEvent.click(screen.getByText("Add Node Right"));
    expect(props.addNode).toHaveBeenCalledWith("right");
  });

  it("toggleStart shows correct label based on node state", () => {
    const startNode: Node = { ...nodes[0], isStart: true };
    render(<ContextMenu {...props} nodes={[startNode]} />);
    expect(screen.getByText("Remove Start State")).toBeInTheDocument();
  });

  it("toggleAccepting shows correct label based on node state", () => {
    const acceptingNode: Node = { ...nodes[0], isAccepting: true };
    render(<ContextMenu {...props} nodes={[acceptingNode]} />);
    expect(screen.getByText("Remove Accepting State")).toBeInTheDocument();
  });

    it("calls all action callbacks", () => {
    render(<ContextMenu {...props} />);
    fireEvent.click(screen.getByText("Set Start State"));
    fireEvent.click(screen.getByText("Set Accepting State"));
    fireEvent.click(screen.getByText("Change Label Name"));
    fireEvent.click(screen.getByText("Add Edge"));

    expect(props.toggleStart).toHaveBeenCalled();
    expect(props.toggleAccepting).toHaveBeenCalled();
    expect(props.startEditingNodeLabel).toHaveBeenCalled();
    expect(props.startAddingEdge).toHaveBeenCalled();
  });
});