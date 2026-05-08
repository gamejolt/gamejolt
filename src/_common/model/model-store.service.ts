import { reactive, ref } from 'vue';

import { Api, type RequestOptions } from '~common/api/api.service';
import { defineIsolatedState } from '~common/ssr/isolated-state';

export type ModelSaveRequestOptions = RequestOptions & { data?: any };

export interface ModelStoreModel {
	modelStoreId?(): number | string;
	update(data: any): void;
}

export interface RemovableModel {
	_removed: boolean;
}

type ModelConstructor<T extends ModelStoreModel> = new () => T;

/**
 * Keyed by the constructor function itself. Using the constructor reference is
 * intrinsically mangler-proof: a function is its own identity.
 */
const _models = defineIsolatedState(() =>
	ref(new Map<ModelConstructor<ModelStoreModel>, Map<number | string, ModelStoreModel>>())
);

function _getOrCreateModelMap<T extends ModelStoreModel>(modelConstructor: ModelConstructor<T>) {
	const all = _models().value;
	let forModelType = all.get(modelConstructor);
	if (!forModelType) {
		forModelType = new Map();
		all.set(modelConstructor, forModelType);
	}
	return forModelType as Map<number | string, T>;
}

/**
 * Will register new model data with the store and return the corresponding
 * reactive instance.
 */
export function storeModel<T extends ModelStoreModel>(
	modelConstructor: ModelConstructor<T>,
	data: Record<string, any>
): T {
	if (!data || Object.keys(data).length === 0) {
		throw new Error(`Called storeModel with empty data: ${modelConstructor.name}.`);
	}

	const id = _getModelId(data);
	const modelMap = _getOrCreateModelMap(modelConstructor);
	let targetModel = modelMap.get(id);

	if (targetModel) {
		targetModel.update(data);
		return targetModel;
	}

	targetModel = reactive(new modelConstructor()) as T;
	targetModel.update(data);
	modelMap.set(id, targetModel);

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
	return _models().value.get(modelConstructor)?.get(id) as T | undefined;
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
