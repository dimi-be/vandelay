import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import {
    FileNode,
    FileNodeType,
    NoDirError,
    NoFileError,
    IMeta,
} from ".";

export class FileRepository {
    public static async readDirectory(dir: string | FileNode): Promise<FileNode[]> {
        const dirPath = typeof dir === 'string' ? dir : dir.path;

        const stats = await fs.promises.stat(dirPath);

        if(!stats.isDirectory()) {
            throw new NoDirError(dirPath);
        }

        const children = fs.readdirSync(dirPath);
        return children.map(x => {
            const childPath = path.join(dirPath, x);
            const stats = fs.statSync(childPath);

            if(stats.isDirectory()) {
                return <FileNode>{
                    type: FileNodeType.directory,
                    name: path.basename(x),
                    path: childPath,
                };
            }

            if(stats.isFile()) {
                return <FileNode>{
                    type: FileNodeType.file,
                    name: path.basename(x),
                    path: childPath,
                    extension: path.extname(x),
                }
            }

            return undefined;
        }).filter(x => x);
    }

    public static async openHtmlDocument(node: FileNode): Promise<Document> {
        if(node.type !== FileNodeType.file) {
            throw new NoFileError(node.path);
        }

        const buffer = await fs.promises.readFile(node.path);
        const jsdom = new JSDOM(buffer);
        return jsdom.window.document;
    }

    public static async getPageMeta(node: FileNode): Promise<IMeta>{
        const document = await FileRepository.openHtmlDocument(node);

        return {
            node,
            title: document.title,
        };
    }

    public static ensureNode(nodePath: string): FileNode | undefined {
        const stats = fs.statSync(nodePath);

        if(stats.isDirectory()) {
            return <FileNode>{
                type: FileNodeType.directory,
                name: path.basename(nodePath),
                path: nodePath,
            };
        }

        if(stats.isFile()) {
            return <FileNode>{
                type: FileNodeType.file,
                name: path.basename(nodePath),
                path: nodePath,
                extension: path.extname(nodePath),
            }
        }

        return undefined;
    }
}