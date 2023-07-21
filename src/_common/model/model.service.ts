import { HidePrivateKeys, Primitives } from '../../utils/utils';
import { Api, ApiProgressEvent, RequestOptions } from '../api/api.service';

/**
 * Helper type that looks like our model classes.
 */
export type ModelClassType<T> = { new (data?: any): T };

export type ModelSaveRequestOptions = RequestOptions & { data?: any };

/**
 * A recursive utility type that represents data that is used to construct a
 * model.
 *
 * Use this when you want to signify that you're working with model data, but
 * not the actual model class, e.g. when handling payloads from backend.
 *
 * It sucks for hover tooltips, but does a good enough job at catching common
 * errors.
 */
export type ModelData<T> = HidePrivateKeys<{
	[K in keyof T]: T[K] extends Primitives | Primitives[]
		? T[K]
		: T[K] extends Model
		? ModelData<T[K]>
		: T[K] extends (infer U)[]
		? U extends Model
			? ModelData<U>[]
			: never
		: never;
}>;

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
	_progress: ApiProgressEvent | null = null;

	// We need to create some methods dynamically on the model.
	// These get defined in defineLegacyModel().
	static populate: <T = any>(rows: (T | ModelData<T>)[]) => T[];
	assign(_other: any): void {}

	/**
	 * @deprecated Use {@link defineLegacyModel} instead.
	 */
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

/**
 * This is the new way to define a legacy model. It doesn't use side effects.
 * Use instead of Model.create from now on.
 *
 * @__NO_SIDE_EFFECTS__
 */
export const defineLegacyModel = <T extends new (...args: any[]) => Model>(base: T) =>
	class extends base {
		// These need to be created dynamically for each model type.
		static populate(rows: any[]): any[] {
			console.log('POPULATE', base, rows);
			const models: any[] = [];
			if (rows && Array.isArray(rows) && rows.length) {
				for (const row of rows) {
					models.push(new base(row));
				}
			}
			return models;
		}

		assign(this: any, other: any) {
			// Some times the model constructors add new fields when populating.
			// This way we retain those fields.
			const newObj = new base(other);

			const keys = Object.keys(newObj);
			for (const k of keys) {
				// For some reason this was throwing some weird errors when
				// saving some forms (like key group form). Couldn't figure it
				// out, so I'm wrapping it. It still seems to work okay.
				try {
					this[k] = (newObj as any)[k];
				} catch (e) {
					console.warn(`Got an error when setting a model value (key ${k}) in assign().`);
					console.warn(e);
				}
			}
		}
	};
