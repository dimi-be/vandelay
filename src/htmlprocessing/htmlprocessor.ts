import { FileNode } from "../filesystem";
import { ProcessorBase } from ".";
import { Foreach } from "./foreach";

export class HtmlProcessor extends ProcessorBase {
    private _processors: ProcessorBase[];

    public constructor(rootNode: FileNode) {
        super(rootNode);
        this._processors = [
            new Foreach(this._rootNode),
        ];
    }

    public async process(document: Document) {
        for(const processor of this._processors) {
            await processor.process(document);
        }
    }
}