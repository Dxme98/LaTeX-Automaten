export interface Node {
  id: string;
  gridX: number;
  gridY: number;
  label: string;
  isStart: boolean;
  isAccepting: boolean;
}

export interface Edge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  style: EdgeStyle;
}

export interface EdgeStyle {
  bend: "none" | "left" | "right";
  labelPosition: "above" | "below" | "left" | "right";
  isLoop: boolean;
  loopPosition?: "above" | "below" | "left" | "right";
}

export interface GridPosition {
  x: number;
  y: number;
}
