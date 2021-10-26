import path from "path";
import { FileRepository } from "./repositories/filerepository"

const rootDir = path.resolve(process.argv[2]);

console.log('rootDir', rootDir);

(async () => {
    const index = path.join(rootDir, 'index.html');
    const indexDoc = await FileRepository.OpenHtmlDocument(index);

    console.log(indexDoc.getElementsByTagName('html')[0].innerHTML);
})();