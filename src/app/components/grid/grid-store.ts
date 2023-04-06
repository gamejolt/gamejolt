import { computed, inject, InjectionKey, ref, watch } from 'vue';
import { ContentFocus } from '../../../_common/content-focus/content-focus.service';
import { bangRef } from '../../../utils/vue';
import { AppStore } from '../../store';
import { setChatFocused } from '../chat/client';
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
	let _isLoadingGrid = false;
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

	// Sync up focus state for chat.
	watch(
		() => ContentFocus.isWindowFocused,
		isFocused => {
			if (!chat.value) {
				return;
			}

			// When the window is unfocused, start counting notifications for
			// current room.
			if (!isFocused) {
				// Notify the client that we are unfocused, so it should start
				// accumulating notifications for the current room.
				setChatFocused(chat.value, false);
			} else {
				// Notify the client that we aren't unfocused anymore.
				setChatFocused(chat.value, true);
			}
		}
	);

	async function loadGrid() {
		_wantsGrid = true;

		if (_isLoadingGrid) {
			return;
		}

		_isLoadingGrid = true;
		const { createGridClient } = await GridClientLazy();
		_isLoadingGrid = false;

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

	/**
	 * Function that calls a callback whenever the current instance of grid gets
	 * connected.
	 *
	 * This function is different from `whenGridBootstrapped` because
	 * bootstrapped is called as soon as we have a grid instance. it doesnt have
	 * to be connected yet while this function is called every time the current
	 * grid instance is connected.
	 */
	function whenGridConnects(cb: (client: GridClient) => void) {
		// TODO(realtime-reactions) implement this.
	}

	return { grid, chat, chatUnsafe, loadGrid, clearGrid, whenGridBootstrapped };
}
