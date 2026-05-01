import { defineIsolatedState } from '~common/ssr/isolated-state';

export type RegistryItemConfig = {
	maxItems: number;
};

const _state = defineIsolatedState(() => ({
	config: {} as { [k: string]: RegistryItemConfig },
	items: {} as { [k: string]: any[] },
}));

export function setRegistryConfig(type: string, config: RegistryItemConfig) {
	_state().config[type] = config;
}

export function storeInRegistry(type: string, newItems: any[] | any) {
	const state = _state();

	if (typeof state.config[type] === 'undefined') {
		state.config[type] = { maxItems: 0 };
	}

	if (!state.config[type].maxItems) {
		return;
	}

	if (typeof state.items[type] === 'undefined') {
		state.items[type] = [];
	}

	if (!Array.isArray(newItems)) {
		newItems = [newItems];
	}

	// We remove new items from the current array so that they put at the
	// end and don't get cleaned out.
	const toRemove = [];
	for (const item of newItems) {
		for (let i = 0; i < state.items[type].length; ++i) {
			if (state.items[type][i].id === item.id) {
				toRemove.push(i);
				break;
			}
		}
	}

	if (toRemove.length) {
		for (const index of toRemove) {
			state.items[type].splice(index, 1);
		}
	}

	state.items[type] = state.items[type].concat(newItems);
	state.items[type] = state.items[type].slice(-state.config[type].maxItems);
}

export function findInRegistry<T>(type: string, fn: (i: T) => boolean): T | null {
	const state = _state();
	if (typeof state.items[type] === 'undefined') {
		state.items[type] = [];
	}

	return state.items[type].find(fn) || null;
}
