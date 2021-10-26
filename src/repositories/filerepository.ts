import fs from "fs";

import { JSDOM } from "jsdom";

const { readFile } = fs.promises;

export class FileRepository {
    public static ReadDir(path: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }

    public static ReadFile(path: string): Promise<Buffer> {
        return readFile(path);
    }

    public static async OpenHtmlDocument(path: string): Promise<Document> {
        const buffer = await this.ReadFile(path);
        const jsdom = new JSDOM(buffer);
        return jsdom.window.document;
    }
}