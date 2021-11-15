import { FileNode } from "../filesystem";

export abstract class ProcessorBase {
    public constructor(protected _rootNode: FileNode){ }

    public abstract process(document: Document): Promise<void>;

    protected _inBraces(value: string) {
        return value.startsWith('{') && value.endsWith('}');
    }
}