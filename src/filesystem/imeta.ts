import { FileNode } from ".";

export interface IMeta {
    node: FileNode;
    title: string;
    author: string;
    created?: Date;
    modified?: Date;
    description: string;
}