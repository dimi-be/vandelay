export class NoDirError extends Error {
    constructor(dirPath: string) {
        super(`${dirPath} is not a directory`);
    }
}

export class NoFileError extends Error {
    constructor(dirPath: string) {
        super(`${dirPath} is not a file`);
    }
}