import { renderHook, act } from "@testing-library/react";
import { useAutomaton } from "../../hooks/useAutomaton";
import '@testing-library/jest-dom'

describe("useAutomaton", () => {
    it("starts in initial state with no nodes or edges", () => {
        const { result } = renderHook(useAutomaton);
        expect(result.current.nodes).toEqual([]);
        expect(result.current.edges).toEqual([]);
    });

    it("add first node q0 when you start", () => {
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();
        });

        expect(result.current.nodes).toHaveLength(1);
        expect(result.current.nodes[0]).toMatchObject({
            id: "q0",
            isStart: true,
            isAccepting: false,
        });
    });

    it("add Node to the right of the selected node", () => {
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();   
        })

        act(() => {
            result.current.addNode("right", "q0");
        });

        expect(result.current.nodes).toHaveLength(2);
        expect(result.current.nodes[1]).toMatchObject({
            id: "q1",
            gridX: 2,
            gridY: 0,
        });
    });

    it("shifts all nodes in a certain direction from the selected node", () => {
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();   
        })

        act(() => {
            result.current.addNode("right", "q0");
        });

        act(() => {
            result.current.addNode("right", "q1");
        });

        expect(result.current.nodes).toHaveLength(3);
        expect(result.current.nodes[1]).toMatchObject({
            id: "q1",
            gridX: 2,
            gridY: 0,
        });
        expect(result.current.nodes[2]).toMatchObject({
            id: "q2",
            gridX: 4,
            gridY: 0,
        });

        act(() => {
            result.current.addNode("right", "q0"); // füge q3 zwischen q0 und q1, sodass q1 und q2 nach rechts verschoben werden
        });

        expect(result.current.nodes).toHaveLength(4);
        expect(result.current.nodes[1]).toMatchObject({
            id: "q1",
            gridX: 4, // q1 wird durch die Verschiebung um 2 stellen verschoben
            gridY: 0,
        });
        expect(result.current.nodes[2]).toMatchObject({
            id: "q2",
            gridX: 6, // q2 wird durch die Verschiebung um 2 stellen verschoben
            gridY: 0,
        });
    });

    it("toggle start state of the node", () => {
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();
        });

        act(() => {
            result.current.toggleStart("q0");
        });

        expect(result.current.nodes[0]).toMatchObject({
            id: "q0",
            isStart: false,
        });
    });

    it("toggle accepting state of the node", () => {
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();
        });

        act(() => {
            result.current.toggleAccepting("q0");
        });

        expect(result.current.nodes[0]).toMatchObject({
            id: "q0",
            isAccepting: true,
        });
    });

    it("add an edge between two nodes", () =>{
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();
        });

        act(() => {
            result.current.addNode("right", "q0");
        });

        act(() => {
            result.current.addEdge("q0", "q1");
        });

        expect(result.current.edges[0]).toMatchObject({
            fromNodeId: "q0",
            toNodeId: "q1",
            label: "a",
        })
    })

    it("update edge style", () =>{
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();
        });

        act(() => {
            result.current.addNode("right", "q0");
        });

        act(() => {
            result.current.addEdge("q0", "q1");
        });

        const edgeID = result.current.edges[0].id

        act(() => {
            result.current.updateEdgeStyle(edgeID, { bend: "left", bendAmount: 50});
        });

        expect(result.current.edges[0].style).toMatchObject({
            bend: "left",
            bendAmount: 50,
        })
    })

    it("update edge label", () =>{
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();
        });

        act(() => {
            result.current.addNode("right", "q0");
        });

        act(() => {
            result.current.addEdge("q0", "q1");
        });

        const edgeID = result.current.edges[0].id

        act(() => {
            result.current.updateEdgeLabel(edgeID, "kante1");
        });

        expect(result.current.edges[0].label).toBe("kante1");
    })

    it("update node label", () =>{
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();
        });

        act(() => {
            result.current.updateNodeLabel("q0", "knoten1")
        });

        expect(result.current.nodes[0].label).toBe("knoten1")
    })

    it("undo last change", () =>{
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();
        });

        act(() => {
            result.current.addNode("right", "q0");
        });

        expect(result.current.nodes).toHaveLength(2);

        act(() => {
            result.current.undoLastAction();
        });

        expect(result.current.nodes).toHaveLength(1);
    })

    it("clear automaton", () =>{
        const { result } = renderHook(useAutomaton);

        act(() => {
            result.current.addFirstNode();
        });

        act(() => {
            result.current.addNode("right", "q0");
        });

        expect(result.current.nodes).toHaveLength(2);

        act(() => {
            result.current.clearAutomaton();
        });

        expect(result.current.nodes).toHaveLength(0);
    })  
});