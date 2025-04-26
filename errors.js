//instanciation
class InvalidConnectionParamsError extends Error{
    constructor(message) {
        super(message);
        this.name = "InvalidConnectionParamsError";
    }
}

class InvalidCommandParamsError extends Error{
    constructor(message) {
        super(message);
        this.name = "InvalidCommandParamsError";
    }
}

//commands
class InvalidCommandError extends Error{
    constructor(message) {
        super(message);
        this.name = "InvalidCommandError";
    }
}

//image not deleted error
class DeleteImageError extends Error{
    constructor(message) {
        super(message);
        this.name = "DeleteImageError";
    }
}

// i/o
class InvalidAPIKeyError extends Error{
    constructor(message) {
        super(message);
        this.name = "InvalidAPIKeyError";
    }
}

class InvalidFolderError extends Error{
    constructor(message) {
        super(message);
        this.name = "InvalidFolderError";
    }
}

class InvalidFilenameError extends Error{
    constructor(message) {
        super(message);
        this.name = "InvalidFilenameError";
    }
}

class FileNotFoundError extends Error{
    constructor(message) {
        super(message);
        this.name = "FileNotFoundError";
    }
}


module.exports = {
    InvalidConnectionParamsError,
    InvalidCommandError,
    DeleteImageError,
    InvalidCommandParamsError,
    InvalidAPIKeyError,
    InvalidFolderError,
    InvalidFilenameError,
    FileNotFoundError
}