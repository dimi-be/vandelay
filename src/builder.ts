import path from "path";
import fs from "fs";
import os from 'os';
import { FileRepository } from "./repositories/filerepository";

export class Builder {
    public async build(srcPath: string, targetPath: string){
        const index = path.join(srcPath, 'index.html');
        const indexDoc = await FileRepository.OpenHtmlDocument(index);
    
        const targetFilePath = path.join(targetPath, 'index.html');
        const targetFile = fs.openSync(targetFilePath, 'w');

        fs.writeSync(targetFile, '<!DOCTYPE html>');
        fs.writeSync(targetFile, os.EOL);
        fs.writeSync(targetFile, indexDoc.querySelector('html').outerHTML);
        fs.closeSync(targetFile);
    }
}