import { computed, inject, InjectionKey, ref } from 'vue';
import { bangRef } from '../../../utils/vue';
import { AppStore } from '../../store';
import { GridClientLazy } from '../lazy';
import { type GridClient } from './client.service';

export type GridStore = ReturnType<typeof createGridStore>;
export const GridStoreKey: InjectionKey<GridStore> = Symbol('grid-store');

export function useGridStore() {
	return inject(GridStoreKey)!;
}

export function createGridStore({ appStore }: { appStore: AppStore }) {
	const grid = ref<GridClient>();

	let _wantsGrid = false;
	let _moduleLoadPromise: Promise<typeof import('./client.service')> | null = null;
	let _bootstrapResolvers: ((client: GridClient) => void)[] = [];

	/**
	 * A helper to get the chat client more easily.
	 */
	const chat = computed(() => grid.value?.chat ?? undefined);

	/**
	 * A helper to get the chat client, but removes nullability, so only access
	 * this if you are absolutely sure there is a chat around.
	 */
	const chatUnsafe = bangRef(chat);

	/**
	 * A helper to get the chat client only if it has an active connection.
	 */
	const connectedChat = computed(() => (chat.value?.connected ? chat.value : null));

	async function loadGrid() {
		_wantsGrid = true;

		_moduleLoadPromise ??= GridClientLazy();
		const { createGridClient } = await _moduleLoadPromise;

		// If they disconnected before we loaded it in.
		if (!_wantsGrid) {
			return;
		}

		_setGrid(createGridClient({ appStore }));
	}

	function _setGrid(newGrid?: GridClient) {
		if (newGrid) {
			for (const resolver of _bootstrapResolvers) {
				resolver(newGrid);
			}
			_bootstrapResolvers = [];
		}

		grid.value = newGrid;
	}

	/**
	 * Destroys and unsets the current grid instance if one exists.
	 *
	 * This action does not abort itself if we requested to load the grid while
	 * this was disconnecting. The grid instance that was set when this function
	 * was invoked will be destroyed.
	 */
	async function clearGrid() {
		_wantsGrid = false;

		const gridFrozen = grid.value;
		if (!gridFrozen) {
			return;
		}

		// We unset the grid immediately to avoid a race condition where the
		// grid is cleared multiple times and getting instantiated between the
		// actual calls to destroy()
		grid.value = undefined;
		await gridFrozen.disconnect();
	}

	/**
	 * Returns a promise that resolves once the Grid client is available.
	 */
	function whenGridBootstrapped() {
		return new Promise<GridClient>(resolve => {
			if (grid.value) {
				resolve(grid.value);
			} else {
				_bootstrapResolvers.push(resolve);
			}
		});
	}

	return { grid, chat, chatUnsafe, connectedChat, loadGrid, clearGrid, whenGridBootstrapped };
}
