export type INode = {
    type: NodeType.directory;
    path: string;
    name: string;
} | {
    type: NodeType.file;
    path: string;
    name: string;
    extension: string;
};

export enum NodeType {
    directory,
    file,
};

// export interface IFile extends INode {
//     type: NodeType.file;
//     extension: string;
// }

// export interface IDirectory extends INode {
//     type: NodeType.directory;
// }