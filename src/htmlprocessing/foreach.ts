import {
    FileNode,
    FileNodeType,
    getPageMeta
} from "../filesystem";
import { ProcessorBase } from "./processorbase";

interface IForEachStatement{
    varName: string;
    colName: string;
    collection: FileNode[];
}

const ATTRIBUTE_NAME = "va-foreach";

export class Foreach extends ProcessorBase {
    public async process(document: Document) {
        const templates = document.querySelectorAll(`[${ATTRIBUTE_NAME}]`);

        for(const template of templates) {
            const statement = this._parseStatement(template);
            const parent = template.parentElement;
            
            for(const item of statement.collection) {
                const itemMeta = await getPageMeta(item);
                const postEl = <Element>template.cloneNode(true);
                postEl.removeAttribute(ATTRIBUTE_NAME);
                postEl.innerHTML = postEl.innerHTML.replace(`{${statement.varName}.title}`, itemMeta.title);
                parent.appendChild(postEl);
            }

            parent.removeChild(template);
        }
    }

    private _parseStatement(statement: Element): IForEachStatement{
        const value = statement.getAttribute(ATTRIBUTE_NAME).trim();

        if(!this._inBraces(value) || this._rootNode.type != FileNodeType.directory) {
            throw new Error('');
        }

        const statementParts = value
            .replace('{', '')
            .replace('}', '')
            .split(' ')
            .map(x => x.trim());

        if(statementParts.length != 3 || statementParts[1] != 'in') {
            throw new Error('');
        }

        const colNode = this._rootNode.children.filter(x => x.name == statementParts[2]).pop();
        const collection = colNode && colNode.type == FileNodeType.directory ? colNode.children : [];

        return {
            varName: statementParts[0],
            colName: statementParts[2],
            collection: collection.filter(x => !x.special),
        }
    }
}