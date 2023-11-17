import { reactive, ref } from 'vue';
import { Api, type RequestOptions } from '../api/api.service';

export type ModelSaveRequestOptions = RequestOptions & { data?: any };

export interface ModelStoreModel {
	modelStoreId?(): number | string;
	update(data: any): void;
}

export interface RemovableModel {
	_removed: boolean;
}

type ModelConstructor<T extends ModelStoreModel> = new () => T;

const _models = ref(new Map<string, ModelStoreModel>());

/**
 * Will register new model data with the store and return the corresponding
 * reactive instance.
 */
export function storeModel<T extends ModelStoreModel>(
	modelConstructor: ModelConstructor<T>,
	data: Record<string, any>
): T {
	const typename = modelConstructor.name;

	if (!data || Object.keys(data).length === 0) {
		throw new Error(`Called storeModel with empty data: ${typename}.`);
	}

	const id = _getModelId(data);
	const key = _generateKey(typename, id);
	let targetModel = _models.value.get(key) as T | undefined;

	if (targetModel) {
		targetModel.update(data);
		return targetModel;
	}

	targetModel = reactive(new modelConstructor()) as T;
	targetModel.update(data);
	_models.value.set(key, targetModel);

	return targetModel;
}

/**
 * Convience for storing data for multiple models in the model store and
 * returning the resulting array of reactive models.
 */
export function storeModelList<T extends ModelStoreModel>(
	modelConstructor: ModelConstructor<T>,
	rows: Record<string, any>[]
): T[] {
	const models: T[] = [];
	if (rows && Array.isArray(rows) && rows.length) {
		for (const row of rows) {
			models.push(storeModel(modelConstructor, row));
		}
	}
	return models;
}

/**
 * Retrieves a model from the model store.
 */
export function getModel<T extends ModelStoreModel>(
	modelConstructor: ModelConstructor<T>,
	id: number | string
) {
	const key = _generateKey(modelConstructor.name, id);
	return _models.value.get(key) as T | undefined;
}

function _getModelId(modelData: any) {
	let id: number | string | undefined;
	if (typeof modelData?.modelStoreId === 'function') {
		id = modelData.modelStoreId();
	} else {
		id = modelData.id;
	}

	if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
		throw new Error(`Tried registering model with a null id.`);
	}

	return id;
}

function _generateKey(typename: string, id?: number | string) {
	if (!id) {
		throw new Error(`Tried generating key for model with a null id: ${typename}`);
	}

	return `${typename}:${id}`;
}

export async function saveModel<T extends ModelStoreModel>(
	modelConstructor: ModelConstructor<T>,
	{
		url,
		field,
		data,
		requestOptions,
	}: {
		/**
		 * The API endpoint that we'll call.
		 */
		url: string;

		/**
		 * This is the field name in the response object that the updated model
		 * data should be returned.
		 */
		field: string;

		/**
		 * The model data that we'll send to the API. It can be empty if the
		 * endpoint doesn't expect any data. For example, for endpoints that
		 * just create and return the newly created model.
		 */
		data?: any;

		/**
		 * Any additional options to pass to the API call.
		 */
		requestOptions?: RequestOptions;
	}
) {
	// Always force a POST (passing in an object).
	const response = await Api.sendRequest(url, data || {}, requestOptions);
	return _processSaveModel(modelConstructor, response, field);
}

async function _processSaveModel<T extends ModelStoreModel>(
	modelConstructor: ModelConstructor<T>,
	response: any,
	field: string
) {
	if (response.success && response[field]) {
		return {
			model: storeModel(modelConstructor, response[field]),
			response,
		};
	}

	throw response;
}

export async function removeModel<T = any>(
	model: RemovableModel,
	url: string,
	options?: ModelSaveRequestOptions
) {
	// Always force a POST (passing in an object).
	const response = await Api.sendRequest<T>(
		url,
		options && options.data ? options.data : {},
		options
	);
	return _processRemoveModel(model, response);
}

function _processRemoveModel(model: RemovableModel, response: any) {
	if (response.notProcessed) {
		return Promise.resolve(response);
	}

	if (response.success) {
		model._removed = true;
		return Promise.resolve(response);
	}

	return Promise.reject(response);
}
