const assert = require('assert');
const supertest = require('supertest');

const { UploadClient } = require('../UploadClient');
const { PutObjectCommand, DeleteObjectCommand } = require('../commands');
const errors = require('../errors');

require('dotenv').config();

const API_KEY = process.env.API_KEY;
const BASEURL= process.env.BASEURL;

const folder = 'test-folder';
const filename = 'test-image.jpg';
const testData = Buffer.from('fake image data from string.');

const client = new UploadClient({
	baseUrl: BASEURL,
	apiKey: API_KEY
});

describe('send buffer to client and delete', () => {
	
	it('should upload a file using UploadClient and PutObjectCommand', async () => {
		const command = new PutObjectCommand({
			folder: folder,
			filename: filename,
			body: testData
		});

		const result = await client.send(command);
		assert.ok(result, 'Upload result should not be null or undefined');

		const response = await supertest(BASEURL)
			.get(`/image/${folder}/${filename}`)
			.expect(200);

		assert(response.body.equals(testData), 'Returned buffer should equal test buffer');
	});

	it('should delete using delete command, and verify it is deleted', async () => {
		
        // Delete the file
		const command = new DeleteObjectCommand({
			folder: folder,
			filename: filename,
		});

		const result = await client.delete(command);
		assert.ok(result, 'remove result should be okay');

        // Confirm deletion (expect 404 or similar)
        await supertest(BASEURL)
        .get(`/image/${folder}/${filename}`)
        .expect(404);
	});
});

describe('setup error checking', () => {

	describe('invalid instanciation of commands', () => {
		it('should throw InvalidCommandParamsError when command is wrong', async () => {
			try {
				const command = new PutObjectCommand({});
				assert(false, "didn't throw any error");
			}
			catch (err) {
				assert(err instanceof errors.InvalidCommandParamsError, "Should throw invalid params error when invalid put params");
			}
	
			try {
				const command = new DeleteObjectCommand({});
				assert(false, "didn't throw any error");
			}
			catch (err) {
				assert(err instanceof errors.InvalidCommandParamsError, "Should throw invalid params error when invalid delete params");
			}
		});
	});
	
	describe('invalid instanciation of client', () => {
		it('should throw InvalidConnectionParamsError when client params is wrong', async () => {
			try {
				const client = new UploadClient({});
				assert(false, "didn't throw any error");
			}
			catch (err) {
				assert(err instanceof errors.InvalidConnectionParamsError, "Should throw invalid params error when invalid connection params");
			}
		});
	});

	describe('invalid command sent to action method', () => {
		it('should throw InvalidCommandError when passing command to method', async () => {
			try {
				const dummyClient = new UploadClient({
					baseUrl: 'baseUrl',
					apiKey: 'apiKey'
				});
				const delCommand = new DeleteObjectCommand({
					folder: folder,
					filename: filename,
				});
				await dummyClient.send(delCommand);

				assert(false, "didn't throw any error for send method");
			} catch (err) {
				assert(err instanceof errors.InvalidCommandError, "didn't throw invalid command error for send method");
			}

			
			try {
				const dummyClient = new UploadClient({
					baseUrl: 'baseUrl',
					apiKey: 'apiKey'
				});
				const sendCommand = new PutObjectCommand({
					folder: folder,
					filename: filename,
					body: testData
				});
				await dummyClient.delete(sendCommand);

				assert(false, "didn't throw any error for delete method");
			} catch (err) {
				assert(err instanceof errors.InvalidCommandError, "didn't throw invalid command error for delete method");
			}
		});
	});
});

describe('image server error statuses', () => {
	it('should get no apikey error when sending with invalid api key', async () => {

		const invalidClient = new UploadClient({
			baseUrl: BASEURL,
			apiKey: 'invalid_key'
		});

		let command = new PutObjectCommand({
			folder: folder,
			filename: filename,
			body: testData
		});

		try {
			await invalidClient.send(command);
			throw new Error("send did not return any error");
		} catch (err) {
			assert(err instanceof errors.InvalidAPIKeyError, "Send did not return invalid api key error"); 
		}
		
		command = new DeleteObjectCommand({
			folder: folder,
			filename: filename
		});

		try {
			await invalidClient.delete(command);
			throw new Error("delete did not return any error");
		} catch (err) {
			assert(err instanceof errors.InvalidAPIKeyError, "delete did not return invalid api key error"); 
		}
	});

	it('should get invalidfolderError when sending invalid folder', async () => {
		let command = new PutObjectCommand({
			folder: 'invalid_folder',
			filename: filename,
			body: testData
		})

		try {
			await client.send(command);
			throw new Error("send did not return any error");
		} catch (err) {
			assert(err instanceof errors.InvalidFolderError, "send did not return invalid folder error");
		}

		command = new DeleteObjectCommand({
			folder: 'invalid_folder',
			filename: filename
		});

		try {
			await client.delete(command);
			throw new Error("delete did not return any error");
		} catch (err) {
			assert(err instanceof errors.InvalidFolderError, "delete did not return invalid api key error"); 
		}
	});

	it('should get file not found error when attempting to delete non existent image', async () => {
		command = new DeleteObjectCommand({
			folder: folder,
			filename: 'invalid_image_name'
		});

		try {
			await client.delete(command);
			throw new Error("delete did not return any error");
		} catch (err) {
			assert(err instanceof errors.FileNotFoundError, "delete did not return invalid api key error"); 
		}
	});
});