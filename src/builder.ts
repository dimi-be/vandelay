import path from "path";
import fs from "fs";
import os from 'os';
import {
    FileNode,
    FileNodeType,
    buildNodeTree,
    FileRepository,
    NoDirError,
} from "./filesystem";
import { Foreach } from "./htmlprocessing";

export class Builder {
    private _rootNode: FileNode;

    constructor(private _srcPath: string, private _targetPath: string){

    }

    public async build(){
        this._rootNode = await buildNodeTree(this._srcPath);
        await this._processTree(this._rootNode);

        // const index = path.join(srcPath, 'index.html');
        // const indexDoc = await FileRepository.openHtmlDocument(index);
    
        // const targetFilePath = path.join(targetPath, 'index.html');
        // const targetFile = fs.openSync(targetFilePath, 'w');

        // const postsDir = path.join(srcPath, 'posts');
        // const posts = (await FileRepository.readDirectory(postsDir))
        //     .filter(x => x.type == NodeType.file && x.extension == '.html' && x.name != 'index.html')
        //     .map(x => x);

        // const postTpl = indexDoc.querySelector("[va-foreach]");
        // const postsEl = postTpl.parentElement;

        // postsEl.removeChild(postTpl);

        // for(const post of posts) {
        //     const page = await FileRepository.getPageMeta(post);
        //     const postEl = <Element>postTpl.cloneNode(true);
        //     postEl.setAttribute('va-foreach', undefined);
        //     postEl.innerHTML = postEl.innerHTML.replace('{post.title}', page.title);
        //     postsEl.appendChild(postEl);
        // }

        // fs.writeSync(targetFile, '<!DOCTYPE html>');
        // fs.writeSync(targetFile, os.EOL);
        // fs.writeSync(targetFile, indexDoc.querySelector('html').outerHTML);
        // fs.closeSync(targetFile);
    }

    private async _processTree(node: FileNode) {
        if(node.type != FileNodeType.directory) {
            throw new NoDirError(node.path);
        }

        await Promise.all(node.children.map(child => {
            if(child.type == FileNodeType.file) {
                return this._processFile(child);
            }

            if(child.type == FileNodeType.directory) {
                return this._processTree(child);
            }
        }));
    }

    private async _processFile(node: FileNode) {
        const processor = new Foreach(this._rootNode);

        const srcDoc = await FileRepository.openHtmlDocument(node);
        const targetPath = this._targetPathFromNode(node);
        const targetDir = path.dirname(targetPath);

        await processor.process(srcDoc);

        await fs.promises.mkdir(targetDir, {recursive: true});

        const targetFile = await fs.promises.open(targetPath, 'w');
        await targetFile.write('<!DOCTYPE html>');
        await targetFile.write(os.EOL);
        await targetFile.write(srcDoc.querySelector('html').outerHTML);
        await targetFile.close();
    }

    private _targetPathFromNode(node: FileNode) {
        if(!node.path.startsWith(this._srcPath)) {
            throw new Error('File is not in source path');
        }

        const srcPath = node.path;
        const relPath = srcPath.substr(this._srcPath.length);
        
        if(!node.special) {
            const targetPath = path.join(this._targetPath, relPath);
            return targetPath;
        }

        const relDir = relPath.substr(0, relPath.length - node.name.length);
        const targetPath = path.join(this._targetPath, relDir, node.name.substr(1));

        return targetPath;
    }
}