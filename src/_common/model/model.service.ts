import { HidePrivateKeys, Primitives } from '../../utils/utils';
import { Api, ApiProgressEvent, RequestOptions } from '../api/api.service';
import { removeModel } from './model-store.service';

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
 * When you only expect some model data to be passed, for example when creating
 * or updating a model.
 */
export type PartialModelData<T> = Partial<ModelData<T>>;

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

	constructor(data?: any) {
		if (data) {
			Object.assign(this, data);
		}
	}

	static populate<T>(this: new (data?: any) => T, rows: (T | ModelData<T>)[]): T[] {
		const models: any[] = [];
		if (rows && Array.isArray(rows) && rows.length) {
			for (const row of rows) {
				models.push(new this(row));
			}
		}
		return models;
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

	assign(other: any): void {
		const modelConstructor = this.constructor as typeof Model;

		// Some times the model constructors add new fields when populating.
		// This way we retain those fields.
		const newObj = new modelConstructor(other);

		const keys = Object.keys(newObj);
		for (const k of keys) {
			// For some reason this was throwing some weird errors when
			// saving some forms (like key group form). Couldn't figure it
			// out, so I'm wrapping it. It still seems to work okay.
			try {
				(this as any)[k] = (newObj as any)[k];
			} catch (e) {
				console.warn(`Got an error when setting a model value (key ${k}) in assign().`);
				console.warn(e);
			}
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
	 * You can call this after an API call that removed the model. Will handle
	 * error codes and set the _removed flag on the model.
	 */
	processRemove(response: any) {
		if (response.notProcessed) {
			return Promise.resolve(response);
		}

		if (response.success) {
			this._removed = true;
			return Promise.resolve(response);
		}

		return Promise.reject(response);
	}

	async $_save(url: string, field: string, options: ModelSaveRequestOptions = {}) {
		// Keep track of progress within the model.
		if (!options.progress) {
			options.progress = event => (this._progress = event);
		}

		const response = await Api.sendRequest(url, options.data || this, options);
		return this.processUpdate(response, field);
	}

	$_remove(url: string, options?: ModelSaveRequestOptions) {
		return removeModel(this, url, options);
	}
}
