import fs from "fs";
import os from 'os';
import path from "path";
import { JSDOM } from "jsdom";
import {
    FileNode,
    FileNodeType,
    NoDirError,
    NoFileError,
    IMeta,
} from ".";


export async function readDirectory(dir: string | FileNode): Promise<FileNode[]> {
    const dirPath = typeof dir === 'string' ? dir : dir.path;

    const stats = await fs.promises.stat(dirPath);

    if(!stats.isDirectory()) {
        throw new NoDirError(dirPath);
    }

    const children = fs.readdirSync(dirPath);
    return (await Promise.all(children.map(async x => {
        const childPath = path.join(dirPath, x);
        return await ensureNode(childPath);
    }))).filter(x => x);
};

export async function openHtmlDocument(node: FileNode): Promise<Document> {
    if(node.type !== FileNodeType.file) {
        throw new NoFileError(node.path);
    }

    const buffer = await fs.promises.readFile(node.path);
    const jsdom = new JSDOM(buffer);
    return jsdom.window.document;
}

export async function saveHtmlDocument(targetPath: string, document: Document) {
    const targetDir = path.dirname(targetPath);
    await fs.promises.mkdir(targetDir, {recursive: true});

    const targetFile = await fs.promises.open(targetPath, 'w');
    await targetFile.write('<!DOCTYPE html>');
    await targetFile.write(os.EOL);
    await targetFile.write(document.querySelector('html').outerHTML);
    await targetFile.close();
}

export async function getPageMeta(node: FileNode): Promise<IMeta>{
    const document = await openHtmlDocument(node);

    return {
        node,
        title: document.title,
    };
}

export async function ensureNode(nodePath: string): Promise<FileNode | undefined> {
    const stats = await fs.promises.stat(nodePath);
    const basicNode = {
        special: path.basename(nodePath).startsWith('_'),
        name: path.basename(nodePath),
        path: nodePath,
    };

    if(stats.isDirectory()) {
        return <FileNode>{
            type: FileNodeType.directory,
            ...basicNode,
        };
    }

    if(stats.isFile()) {
        return <FileNode>{
            type: FileNodeType.file,
            extension: path.extname(nodePath),
            ...basicNode,
        }
    }

    return undefined;
}

export function targetPathFromNode(node: FileNode, srcDir: string, targetDir: string): string {
    if(!node.path.startsWith(srcDir)) {
        throw new Error('File is not in source path');
    }

    const srcPath = node.path;
    const relPath = srcPath.substr(srcDir.length);
    
    if(!node.special) {
        const targetPath = path.join(targetDir, relPath);
        return targetPath;
    }

    const relDir = relPath.substr(0, relPath.length - node.name.length);
    const targetPath = path.join(targetDir, relDir, node.name.substr(1));

    return targetPath;
}