import { computed, inject, InjectionKey, ref, watch } from 'vue';
import { ContentFocus } from '../../../_common/content-focus/content-focus.service';
import { arrayRemove } from '../../../utils/array';
import { bangRef } from '../../../utils/vue';
import { AppStore } from '../../store';
import { setChatFocused } from '../chat/client';
import { GridClientLazy } from '../lazy';
import type {
	DeregisterOnConnected,
	GridClient,
	OnConnectedHandler as GridOnConnectedHandler,
} from './client.service';

export type GridStore = ReturnType<typeof createGridStore>;
export const GridStoreKey: InjectionKey<GridStore> = Symbol('grid-store');

export function useGridStore() {
	return inject(GridStoreKey)!;
}

interface OnConnectedHandler {
	/**
	 * The function to invoke on connection.
	 */
	fn: GridOnConnectedHandler;
	/**
	 * A callback that makes the connection handler remove itself from the grid
	 * store. It also calls gridDeregister if it is defined.
	 */
	deregister: DeregisterOnConnected;
	/**
	 * Deregisters the handler from grid.
	 */
	gridDeregister: DeregisterOnConnected | null;
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

	/**
	 * Callbacks to run when the current grid client instance gets connected.
	 */
	let _onConnectedHandlers: OnConnectedHandler[] = [];

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

		_reapplyOnConnectedHandlers();
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
	 * connected. If grid was already connected when this was called, the
	 * callback will be invoked immediately.
	 *
	 * This function is different from `whenGridBootstrapped` because
	 * bootstrapped is called as soon as we have a grid instance regardless of
	 * whether it is connected or not.
	 *
	 * Notes:
	 * - Callbacks that are registered here will transfer to new instances of
	 *   GridClient automatically.
	 * - The exact same callback may be registered multiple times. It will be
	 *   invoked multiple times in this case.
	 */
	function whenGridConnected(cb: GridOnConnectedHandler): DeregisterOnConnected {
		// Make a connection handler.
		const newHandler: OnConnectedHandler = {
			fn: cb,
			deregister: () => {},
			gridDeregister: null,
		};
		newHandler.deregister = () => {
			arrayRemove(_onConnectedHandlers, i => i === newHandler);
			newHandler.gridDeregister?.();
		};

		_onConnectedHandlers.push(newHandler);

		whenGridBootstrapped().then(curGrid => {
			const cbSafe = () => {
				// Protects against invoking closures from old grid clients.
				if (curGrid !== grid.value) {
					return;
				}
				cb(curGrid);
			};
			newHandler.gridDeregister = curGrid.registerOnConnected(cbSafe);

			if (curGrid.connected) {
				cbSafe();
			}
		});

		return newHandler.deregister;
	}

	/**
	 * Reapplies the connection handlers onto the current instance of grid.
	 */
	function _reapplyOnConnectedHandlers(): void {
		if (!grid.value) {
			throw new Error('Expected grid to be set by now');
		}

		const oldHandlers = _onConnectedHandlers;
		_onConnectedHandlers = [];

		for (const handler of oldHandlers) {
			handler.deregister?.();
			// This should be fully sync since grid is already set.
			whenGridConnected(handler.fn);
		}
	}

	return { grid, chat, chatUnsafe, loadGrid, clearGrid, whenGridBootstrapped, whenGridConnected };
}
