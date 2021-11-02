import fs from "fs";
import path from "path";
import { INode, NodeType } from './inode';
import { NoDirError } from "./errors";
import { File } from "./file";

export class Directory implements INode {
    private _path: string;

    public get path(): string {
        return this._path;
    }

    public get name(): string {
        return path.basename(this._path);
    }

    public get extension(): string {
        return '';
    }

    public get type(): NodeType {
        return NodeType.directory;
    }

    constructor(path: string) {
        const stats = fs.statSync(path);

        if(!stats.isDirectory()) {
            throw new NoDirError(path);
        }

        this._path = path;
    }

    public get childNodes(): INode[] {
        const children = fs.readdirSync(this._path);
        return children.map(x => {
            const childPath = path.join(this._path, x);
            const stats = fs.statSync(childPath);

            if(stats.isDirectory()) {
                return new Directory(childPath);
            }

            if(stats.isFile()) {
                return new File(childPath);
            }

            return undefined;
        }).filter(x => x);
    }
}