import { FileRepository } from ".";

export type FileNode = {
    type: FileNodeType.directory;
    path: string;
    name: string;
    children: FileNode[];
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

export async function buildNodeTree(root: string | FileNode): Promise<FileNode> {
    const node = (typeof root == "string") ? FileRepository.ensureNode(root) : root;

    if(node.type == FileNodeType.directory) {
        node.children = await FileRepository.readDirectory(node);
        
        await Promise.all(node.children.map(x => buildNodeTree(x)));
    }

    return node;
}
