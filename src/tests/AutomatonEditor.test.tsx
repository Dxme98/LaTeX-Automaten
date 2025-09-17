import { render, screen, fireEvent } from "@testing-library/react";
import AutomatonEditor from "../AutomatonEditor";
import '@testing-library/jest-dom'


describe("AutomatonEditor", () => {
    it("renders AutomatonEditor", () => {
        render(<AutomatonEditor />);
        expect(screen.getByText("Add First Node")).toBeInTheDocument();
    });

    it("add first node on button click", () => {
        render(<AutomatonEditor />);

        const addButton = screen.getByText("Add First Node");
        fireEvent.click(addButton);

        // Prüfen, dass ein NodeComponent gerendert wird
        expect(screen.getByText("q0")).toBeInTheDocument();
    });

    it("opens context menu on node click", () => {
        render(<AutomatonEditor />);
        fireEvent.click(screen.getByText("Add First Node")); // füge q0 hinzu

        fireEvent.click(screen.getByTestId("node-q0"));

        // Prüfen, dass ContextMenu gerendert wird
        expect(screen.getByText("Add Node Right")).toBeInTheDocument();
    });
})
