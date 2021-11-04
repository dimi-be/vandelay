import fs from "fs";
import path from "path";
import { INode, NodeType } from './inode';
import { NoFileError } from "./errors";
import { Page } from "./page";

export class File implements INode {
    private _path: string;

    public get path(): string {
        return this._path;
    }

    public get name(): string {
        return path.basename(this._path);
    }

    public get extension(): string {
        return path.extname(this._path);
    }

    public get type(): NodeType {
        return NodeType.file;
    }

    public get page(): Page {
        return new Page(this._path);
    }

    constructor(path: string) {
        const stats = fs.statSync(path);

        if(!stats.isFile()) {
            throw new NoFileError(path);
        }

        this._path = path;
    }
}