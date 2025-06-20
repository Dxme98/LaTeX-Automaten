import { Node, Edge } from "../types";

const getRelativePosition = (node: Node, allNodes: Node[]) => {
  const sortedNodes = [...allNodes].sort((a, b) => {
    const aNum = parseInt(a.id.substring(1));
    const bNum = parseInt(b.id.substring(1));
    return aNum - bNum;
  });
  const referenceNode = sortedNodes[0];

  if (node.id === referenceNode.id) {
    return "";
  }

  let closestNode = referenceNode;
  let minDistance = Infinity;

  for (const otherNode of allNodes) {
    if (otherNode.id === node.id) continue;

    const distance =
      Math.abs(node.gridX - otherNode.gridX) +
      Math.abs(node.gridY - otherNode.gridY);

    const sameRow = node.gridY === otherNode.gridY;
    const sameCol = node.gridX === otherNode.gridX;

    if ((sameRow || sameCol) && distance < minDistance) {
      minDistance = distance;
      closestNode = otherNode;
    }
  }

  const deltaX = node.gridX - closestNode.gridX;
  const deltaY = node.gridY - closestNode.gridY;

  let position = "";

  if (deltaX > 0 && deltaY === 0) {
    position = `right=of ${closestNode.id}`;
  } else if (deltaX < 0 && deltaY === 0) {
    position = `left=of ${closestNode.id}`;
  } else if (deltaY > 0 && deltaX === 0) {
    position = `below=of ${closestNode.id}`;
  } else if (deltaY < 0 && deltaX === 0) {
    position = `above=of ${closestNode.id}`;
  } else {
    if (deltaX > 0) position += `right=of ${referenceNode.id}`;
    else if (deltaX < 0) position += `left=of ${referenceNode.id}`;

    if (deltaY > 0) {
      if (position) position += ", ";
      position += `below=of ${referenceNode.id}`;
    } else if (deltaY < 0) {
      if (position) position += ", ";
      position += `above=of ${referenceNode.id}`;
    }
  }

  return position ? ` [${position}]` : "";
};

export const generateTikzCode = (nodes: Node[], edges: Edge[]) => {
  let tikzCode = `\\begin{tikzpicture}[shorten >=1pt,node distance=2cm,on grid,auto]\n`;

  nodes.forEach((node) => {
    const relativePos = getRelativePosition(node, nodes);
    let nodeOptions = [];

    if (node.isStart) nodeOptions.push("initial");
    if (node.isAccepting) nodeOptions.push("accepting");

    const optionsStr =
      nodeOptions.length > 0 ? `[state,${nodeOptions.join(",")}]` : "[state]";

    tikzCode += `  \\node${optionsStr} (${node.id})${relativePos} {$${node.label}$};\n`;
  });

  tikzCode += `\n`;

  const edgeGroups = edges.reduce((groups, edge) => {
    const key = `${edge.fromNodeId}-${edge.toNodeId}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(edge);
    return groups;
  }, {} as Record<string, Edge[]>);

  tikzCode += `  \\draw\n`;
  const edgeLines: string[] = [];

  Object.values(edgeGroups).forEach((groupEdges) => {
    groupEdges.forEach((edge) => {
      let edgeOptions = [];

      if (edge.style.isLoop) {
        edgeOptions.push(`loop ${edge.style.loopPosition}`);
      } else {
        if (edge.style.bend !== "none") {
          edgeOptions.push(`bend ${edge.style.bend}`);
        }
        if (edge.style.labelPosition !== "above") {
          edgeOptions.push(edge.style.labelPosition);
        }
      }

      const optionsStr =
        edgeOptions.length > 0 ? `[${edgeOptions.join(", ")}]` : "";
      const nodeStr = ` node{${edge.label}}`;

      edgeLines.push(
        `    (${edge.fromNodeId}) edge${optionsStr}${nodeStr} (${edge.toNodeId})`
      );
    });
  });

  tikzCode += edgeLines.join("\n") + ";\n";
  tikzCode += `\\end{tikzpicture}`;

  return tikzCode;
};
