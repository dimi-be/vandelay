import {
    FileNode,
    FileNodeType,
    buildNodeTree,
    openHtmlDocument,
    saveHtmlDocument,
    NoDirError,
    targetPathFromNode,
} from "./filesystem";
import { HtmlProcessor } from "./htmlprocessing";

export class Builder {
    private _rootNode: FileNode;
    private _htmlProcessor: HtmlProcessor;

    constructor(private _srcPath: string, private _targetPath: string) {}

    public async build(){
        this._rootNode = await buildNodeTree(this._srcPath);
        this._htmlProcessor = new HtmlProcessor(this._rootNode);
        await this._processTree(this._rootNode);
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
        const srcDoc = await openHtmlDocument(node);
        const targetPath = targetPathFromNode(node, this._srcPath, this._targetPath);
        await this._htmlProcessor.process(srcDoc);
        await saveHtmlDocument(targetPath, srcDoc);
    }
}