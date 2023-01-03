import { reactive, ref } from 'vue';

export interface ModelStoreModel {
	modelStoreId?(): number | string;
	update(data: any): void;
}

type ModelConstructor<T extends ModelStoreModel> = new (data: any) => T;

const _models = ref(new Map<string, ModelStoreModel>());

/**
 * Will register new model data with the store and return the corresponding
 * reactive instance.
 */
export function storeModel<T extends ModelStoreModel>(
	modelConstructor: ModelConstructor<T>,
	data?: Record<string, any>
): T {
	const typename = modelConstructor.name;

	if (!data) {
		throw new Error(`Called storeModel with empty data: ${typename}.`);
	}

	const id = _getModelId(data);
	const key = _generateKey(typename, id);
	let targetModel = _models.value.get(key) as T | undefined;

	if (targetModel) {
		targetModel.update(data);
		return targetModel;
	}

	targetModel = reactive(new modelConstructor(data)) as T;
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
	id: number
) {
	const key = _generateKey(modelConstructor.name, id);
	return _models.value.get(key);
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
