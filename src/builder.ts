import path from "path";
import fs from "fs";
import os from 'os';
import { NodeType, FileRepository } from "./filesystem";

export class Builder {
    public async build(srcPath: string, targetPath: string){
        const index = path.join(srcPath, 'index.html');
        const indexDoc = await FileRepository.openHtmlDocument(index);
    
        const targetFilePath = path.join(targetPath, 'index.html');
        const targetFile = fs.openSync(targetFilePath, 'w');

        const postsDir = path.join(srcPath, 'posts');
        const posts = (await FileRepository.readDirectory(postsDir))
            .filter(x => x.type == NodeType.file && x.extension == '.html' && x.name != 'index.html')
            .map(x => x);

        const postTpl = indexDoc.querySelector("[va-foreach]");
        const postsEl = postTpl.parentElement;

        postsEl.removeChild(postTpl);

        for(const post of posts) {
            const page = await FileRepository.openPage(post);
            const postEl = <Element>postTpl.cloneNode(true);
            postEl.setAttribute('va-foreach', undefined);
            postEl.innerHTML = postEl.innerHTML.replace('{post.title}', page.title);
            postsEl.appendChild(postEl);
        }

        fs.writeSync(targetFile, '<!DOCTYPE html>');
        fs.writeSync(targetFile, os.EOL);
        fs.writeSync(targetFile, indexDoc.querySelector('html').outerHTML);
        fs.closeSync(targetFile);
    }
}