import { readDirectory, ensureNode } from ".";

export type FileNode = {
    type: FileNodeType.directory;
    special: boolean;
    path: string;
    name: string;
    children: FileNode[];
} | {
    type: FileNodeType.file;
    special: boolean;
    path: string;
    name: string;
    extension: string;
};

export enum FileNodeType {
    directory,
    file,
};

export async function buildNodeTree(root: string | FileNode): Promise<FileNode> {
    const node = (typeof root == "string") ? await ensureNode(root) : root;

    if(node.type == FileNodeType.directory) {
        node.children = await readDirectory(node);
        
        await Promise.all(node.children.map(x => buildNodeTree(x)));
    }

    return node;
}
