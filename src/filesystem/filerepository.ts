import fs from "fs";
import path from "path";
import { INode, NodeType } from "./inode";
import { NoDirError } from "./errors";

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
                    path: x,
                };
            }

            if(stats.isFile()) {
                return <INode>{
                    type: NodeType.file,
                    name: path.basename(x),
                    path: x,
                    extension: path.extname(x),
                }
            }

            return undefined;
        }).filter(x => x);
    }
}