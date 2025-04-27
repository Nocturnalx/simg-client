const axios = require('axios');
const {
	InvalidConnectionParamsError, 
	InvalidCommandError,
	InvalidAPIKeyError,
    InvalidFolderError,
    InvalidFilenameError,
    FileNotFoundError
} = require('./errors');

class UploadClient {
	constructor({ baseUrl, apiKey }) {
		if (!baseUrl || !apiKey) throw new InvalidConnectionParamsError('baseUrl and apiKey are required');
		this.baseUrl = baseUrl.replace(/\/+$/, '');
		this.apiKey = apiKey;
	}

	async send(command) {
		try {
			if (command.constructor.name !== 'PutObjectCommand') throw new InvalidCommandError(`Unsupported command: ${command.constructor.name}`);
			
			const url = `${this.baseUrl}/upload/${encodeURIComponent(command.folder)}`;
			const headers = {
				'Content-Type': 'application/octet-stream',
				'x-filename': command.filename,
				'x-api-key': this.apiKey
			};
	
			let res = await axios.post(url, command.body, { headers }); 
			return res.data;
		}
		catch (err) {
			console.error(`Error uploading ${this.baseUrl}/${command.folder}/${command.filename} response code: ${err.code}`);
			this.#throwErrors(err);
		}
	}

	async delete(command) {
		try {
			if (command.constructor.name !== 'DeleteObjectCommand') throw new InvalidCommandError(`Unsupported command: ${command.constructor.name}`);

			const url = `${this.baseUrl}/remove/${encodeURIComponent(command.folder)}/${encodeURIComponent(command.filename)}`;
			
			const headers = {
				'x-api-key': this.apiKey
			};

			await axios.delete(url, { headers });
			return command.filename;
		}
		catch (err) {
			console.error(`Error deleting ${this.baseUrl}/${command.folder}/${command.filename} response code: ${err.code}`);
			this.#throwErrors(err)
		}

	}

	//axios populates err with the res status etc
	#throwErrors(err){

		if (!err.status) throw err;

		if (err.status == 403) throw new InvalidAPIKeyError();
		else if (err.status == 404) throw new FileNotFoundError();
		else if (err.status == 400) {
			if (err.response.data.code == 'INVFLDR') throw new InvalidFolderError();
			else if(err.response.data.code == 'INVNAME') throw new InvalidFilenameError();
		}
		else throw err;
	}
}

module.exports = { UploadClient };