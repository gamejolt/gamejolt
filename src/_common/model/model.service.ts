import { Api, RequestOptions } from '../api/api.service';

/**
 * Helper type that looks like our model classes.
 */
export type ModelClassType<T> = { new (data?: any): T };

export type ModelSaveRequestOptions = RequestOptions & { data?: any };

/**
 * When you don't know what data is returned from backend, but you know it's for
 * a model.
 */
export type UnknownModelData = Record<string, unknown>;

export class Model {
	id!: number;

	// Set default values so Vue can see them when instantiating the model and
	// set up observers.
	file: File | File[] | null = null;
	_removed = false;
	_progress: ProgressEvent | null = null;

	// We need to create some methods dynamically on the model.
	static populate: <T = any>(rows: (T | ModelClassType<T>)[]) => T[];
	assign!: (other: any) => void;

	static create(self: any) {
		// These need to be created dynamically for each model type.
		self.populate = function (rows: any[]): any[] {
			const models: any[] = [];
			if (rows && Array.isArray(rows) && rows.length) {
				for (const row of rows) {
					models.push(new self(row));
				}
			}
			return models;
		};

		self.prototype.assign = function (this: any, other: any) {
			// Some times the model constructors add new fields when populating.
			// This way we retain those fields.
			const newObj = new self(other);

			const keys = Object.keys(newObj);
			for (const k of keys) {
				// For some reason this was throwing some weird errors when
				// saving some forms (like key group form). Couldn't figure it
				// out, so I'm wrapping it. It still seems to work okay.
				try {
					this[k] = newObj[k];
				} catch (e) {
					console.warn(`Got an error when setting a model value (key ${k}) in assign().`);
					console.warn(e);
				}
			}
		};

		Object.assign(self.prototype, Model.prototype);

		return self;
	}

	/**
	 * You can call this after an API call that created a model.
	 * Will handle the error response and return the newly created model.
	 */
	static processCreate(response: any, field: string): Promise<any> {
		if (response.notProcessed) {
			return Promise.resolve(response);
		}

		if (response.success && response[field]) {
			return Promise.resolve(response);
		}

		return Promise.reject(response);
	}

	constructor(data?: any) {
		if (data) {
			Object.assign(this, data);
		}
	}

	/**
	 * You can call this after an API call that updated the model.
	 * Will pull in the new values for the model as well as handling the error response.
	 */
	processUpdate(response: any, field: string): Promise<any> {
		if (response.notProcessed) {
			return Promise.resolve(response);
		}

		if (response.success) {
			if (response[field]) {
				this.assign(response[field]);
			}
			return Promise.resolve(response);
		}

		return Promise.reject(response);
	}

	/**
	 * You can call this after an API call that removed the model.
	 * Will handle error codes.
	 */
	processRemove(response: any): Promise<any> {
		if (response.notProcessed) {
			return Promise.resolve(response);
		}

		if (response.success) {
			this._removed = true;
			return Promise.resolve(response);
		}

		return Promise.reject(response);
	}

	async $_save(url: string, field: string, options: ModelSaveRequestOptions = {}): Promise<any> {
		// Keep track of progress within the model.
		if (!options.progress) {
			options.progress = event => (this._progress = event);
		}

		const response = await Api.sendRequest(url, options.data || this, options);
		return this.processUpdate(response, field);
	}

	async $_remove(url: string, options?: ModelSaveRequestOptions): Promise<any> {
		// Always force a POST (passing in an object).
		const response = await Api.sendRequest(
			url,
			options && options.data ? options.data : {},
			options
		);
		return this.processRemove(response);
	}
}
