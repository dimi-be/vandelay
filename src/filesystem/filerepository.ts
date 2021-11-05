import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import { INode, NodeType } from "./inode";
import { NoDirError, NoFileError } from "./errors";
import { IPage } from "./ipage";

export class FileRepository {
    public static async readDirectory(dir: string | INode): Promise<INode[]> {
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
                return <INode>{
                    type: NodeType.directory,
                    name: path.basename(x),
                    path: childPath,
                };
            }

            if(stats.isFile()) {
                return <INode>{
                    type: NodeType.file,
                    name: path.basename(x),
                    path: childPath,
                    extension: path.extname(x),
                }
            }

            return undefined;
        }).filter(x => x);
    }

    public static async openHtmlDocument(path: string): Promise<Document> {
        const buffer = await fs.promises.readFile(path);
        const jsdom = new JSDOM(buffer);
        return jsdom.window.document;
    }

    public static async openPage(node: INode): Promise<IPage>{
        if(node.type !== NodeType.file) {
            throw new NoFileError(node.path);
        }

        const document = await FileRepository.openHtmlDocument(node.path);

        return {
            path: node.path,
            title: document.title,
        };
    }
}