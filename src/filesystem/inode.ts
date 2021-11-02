export interface INode {
    path: string;
    name: string;
    extension: string;
    type: NodeType;
};

export enum NodeType {
    directory,
    file,
};