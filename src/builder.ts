import path from "path";
import { writeFileSync } from "fs";
import { FileRepository } from "./repositories/filerepository"

export class Builder {
    public async build(srcPath: string, targetPath: string){
        const index = path.join(srcPath, 'index.html');
        const indexDoc = await FileRepository.OpenHtmlDocument(index);
    
        writeFileSync(`${targetPath}/index.html`, '');
    }
}