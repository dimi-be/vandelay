import fs from "fs";
import { JSDOM } from 'jsdom';

export class Page {
    private _title: string;

    public get path(): string {
        return this._path;
    }

    public get title(): string {
        return this._title;
    }

    constructor(private _path: string){
        const buffer = fs.readFileSync(this._path);
        
        const jsdom = new JSDOM(buffer);
        this._title = jsdom.window.document.title;
    }
}