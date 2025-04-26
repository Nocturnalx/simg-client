const {InvalidCommandParamsError} = require('./errors');

class PutObjectCommand {
	constructor({ folder, filename, body }) {
		if (!folder || !filename || !body) throw new InvalidCommandParamsError();

		this.folder = folder;
		this.filename = filename;
		this.body = body;
	}
}

class DeleteObjectCommand {
	constructor({ folder, filename }) {
		if (!folder || !filename) throw new InvalidCommandParamsError();

		this.folder = folder;
		this.filename = filename;
	}
}

module.exports = { 
    PutObjectCommand,
    DeleteObjectCommand
}