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
            return FileRepository.ensureNode(childPath);
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
        const basicNode = {
            special: path.basename(nodePath).startsWith('_'),
            name: path.basename(nodePath),
            path: nodePath,
        };

        if(stats.isDirectory()) {
            return <FileNode>{
                type: FileNodeType.directory,
                ...basicNode,
            };
        }

        if(stats.isFile()) {
            return <FileNode>{
                type: FileNodeType.file,
                extension: path.extname(nodePath),
                ...basicNode,
            }
        }

        return undefined;
    }
}