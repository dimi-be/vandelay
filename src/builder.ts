import path from "path";
import fs from "fs";
import os from 'os';
import { Directory, NodeType } from "./filesystem";
import { FileRepository } from "./repositories/filerepository";

export class Builder {
    public async build(srcPath: string, targetPath: string){
        const index = path.join(srcPath, 'index.html');
        const indexDoc = await FileRepository.OpenHtmlDocument(index);
    
        const targetFilePath = path.join(targetPath, 'index.html');
        const targetFile = fs.openSync(targetFilePath, 'w');

        const postsDir = new Directory(path.join(srcPath, 'posts'));
        const posts = postsDir.childNodes.filter(x => x.type == NodeType.file && x.extension == '.html' && x.name != 'index.html');

        const postTpl = indexDoc.querySelector("[va-foreach]");
        const postsEl = postTpl.parentElement;

        postsEl.removeChild(postTpl);

        posts.forEach(post => {
            const postEl = <Element>postTpl.cloneNode(true);
            postEl.setAttribute('va-foreach', undefined);
            postEl.innerHTML = postEl.innerHTML.replace('{post.title}', post.name);
            postsEl.appendChild(postEl);
        });

        fs.writeSync(targetFile, '<!DOCTYPE html>');
        fs.writeSync(targetFile, os.EOL);
        fs.writeSync(targetFile, indexDoc.querySelector('html').outerHTML);
        fs.closeSync(targetFile);
    }
}