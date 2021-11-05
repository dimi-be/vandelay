export type FileNode = {
    type: FileNodeType.directory;
    path: string;
    name: string;
} | {
    type: FileNodeType.file;
    path: string;
    name: string;
    extension: string;
};

export enum FileNodeType {
    directory,
    file,
};
