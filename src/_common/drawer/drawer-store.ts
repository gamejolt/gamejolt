import { StickerCount } from '../../app/views/dashboard/stickers/stickers';
import { arrayRemove, numberSort } from '../../utils/array';
import { Analytics } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { Growls } from '../growls/growls.service';
import {
	getCollidingStickerTarget,
	StickerLayerController,
} from '../sticker/layer/layer-controller';
import { StickerPlacement } from '../sticker/placement/placement.model';
import { Sticker } from '../sticker/sticker.model';
import {
	addStickerToTarget,
	getStickerModelResourceName,
	StickerTargetController,
} from '../sticker/target/target-controller';
import { Translate } from '../translate/translate.service';

export const DrawerStoreKey = Symbol('drawer-store');

export class DrawerStore {
	layers: StickerLayerController[] = [];
	drawerItems: StickerCount[] = [];
	targetController: StickerTargetController | null = null;
	placedItem: StickerPlacement | null = null;
	sticker: Sticker | null = null;
	isDrawerOpen = false;
	isDragging = false;
	hasValidTarget = false;
	isHoveringDrawer = false;
	drawerHeight = 0;
	stickerSize = 64;

	_waitingForFrame = false;
	_onPointerMove: ((event: MouseEvent | TouchEvent) => void) | null = null;
	_onPointerUp: ((event: MouseEvent | TouchEvent) => void) | null = null;
	_updateGhostPosition: ((position: { left: number; top: number }) => void) | null = null;

	get activeLayer() {
		// The active layer is always the last to be added to the stack.
		return this.layers[this.layers.length - 1];
	}

	/** Reset the DrawerStore state to their initial values */
	// commented out === handled by function calls
	reset() {
		_removeEventListeners(this);
		_removeDrawerStoreActiveItem(this);
		// _setDraggingState(this, false);

		this.drawerItems = [];
		this.targetController = null;
		this.placedItem = null;
		// this.sticker = null;
		this.isDrawerOpen = false;
		// this.isDragging = false;
		this.hasValidTarget = false;
		this.isHoveringDrawer = false;
		this.drawerHeight = 0;

		this._waitingForFrame = false;
		// this._onPointerMove = null;
		// this._onPointerUp = null;
		this._updateGhostPosition = null;
	}
}

export function registerStickerLayer(store: DrawerStore, layer: StickerLayerController) {
	store.layers.push(layer);
}

export function unregisterStickerLayer(store: DrawerStore, layer: StickerLayerController) {
	arrayRemove(store.layers, i => i === layer);
}

/**
 * Send an API request to get the user stickers.
 */
async function _initializeDrawerContent(store: DrawerStore) {
	const payload = await Api.sendRequest('/web/stickers/dash');

	store.drawerItems = [];
	for (const stickerCountPayload of payload.stickerCounts) {
		const stickerData = payload.stickers.find(
			(i: Sticker) => i.id === stickerCountPayload.sticker_id
		);

		const stickerCount: StickerCount = {
			count: stickerCountPayload.count,
			sticker_id: stickerCountPayload.sticker_id,
			sticker: new Sticker(stickerData),
		};

		store.drawerItems.push(stickerCount);
	}

	store.drawerItems.sort((a, b) => numberSort(b.sticker.rarity, a.sticker.rarity));
}

/**
 * Toggle the shell drawer, initializing the state when opening or resetting it
 * when closing.
 */
export function toggleShellDrawer(store: DrawerStore) {
	store.isDrawerOpen = !store.isDrawerOpen;

	if (store.isDrawerOpen) {
		_initializeDrawerContent(store);
	} else {
		store.reset();
	}
}

export function setDrawerStoreHeight(store: DrawerStore, height: number) {
	store.drawerHeight = height;
}

export function assignDrawerStoreGhostCallback(
	store: DrawerStore,
	callback: (pos: { left: number; top: number }) => void
) {
	store._updateGhostPosition = callback;
}

/**
 * Assign the drawer item that we want to use as a ghost item.
 */
export function setDrawerStoreActiveItem(
	store: DrawerStore,
	sticker: Sticker,
	event?: MouseEvent | TouchEvent,
	fromTarget?: boolean
) {
	// JODO: This might feel cleaner by having the drawer set a separate field - not sure yet.
	if (fromTarget) {
		assignDrawerStoreItem(store, null, null);
	}

	if (!sticker || !event) {
		return;
	}

	if (!store.sticker) {
		store.sticker = sticker;

		if (!fromTarget) {
			alterDrawerStoreItemCount(store, sticker, false);
		}
	}

	_setDraggingState(store, true);
	_onDragItem(store, event);
	_addEventListeners(store, _onPointerMove(store), _onPointerUp(store));
}

/**
 * Assigns the placed item and target controller of the store.
 */
export function assignDrawerStoreItem(
	store: DrawerStore,
	item: StickerPlacement | null,
	controller: StickerTargetController | null
) {
	store.placedItem = item;
	store.targetController = controller;
}

export async function commitDrawerStoreItemPlacement(store: DrawerStore) {
	if (!store.placedItem || !store.targetController) {
		return;
	}

	const sticker = store.placedItem;
	if (!sticker) {
		return;
	}

	Analytics.trackEvent('stickers', 'place-sticker');

	const { targetController } = store;
	const { model } = targetController;
	const resourceType = getStickerModelResourceName(model);
	const { success, resource, parent, stickerPlacement, newSticker } = await Api.sendRequest(
		'/web/stickers/place',
		{
			stickerId: sticker.sticker.id,
			positionX: sticker.position_x,
			positionY: sticker.position_y,
			rotation: sticker.rotation,
			resource: resourceType,
			resourceId: model.id,
		},
		{ detach: true }
	);

	if (success) {
		addStickerToTarget(targetController, new StickerPlacement(stickerPlacement));

		model.assign(resource);
		if (parent && targetController.parent) {
			targetController.parent.model.assign(parent);
		}

		toggleShellDrawer(store);

		// DODO: Get this working
		// if (newSticker) {
		// 	handleNewStickerNotification(
		// 		Translate.$gettext(`You can unlock a new sticker!`),
		// 		Translate.$gettext(`Click this message to unlock right away.`),
		// 		mainStore
		// 	);
		// }
	} else {
		Growls.error(Translate.$gettext(`Failed to place sticker.`));
	}
}

/**
 * Add or subtract from the drawer item count
 */
export function alterDrawerStoreItemCount(
	store: DrawerStore,
	sticker: Sticker,
	returnToDrawer = false
) {
	const drawerItem = store.drawerItems.find(i => {
		return i.sticker.id === sticker.id;
	});

	// This shouldn't ever trigger
	if (!drawerItem) {
		return;
	}

	if (returnToDrawer) {
		drawerItem.count++;
		assignDrawerStoreItem(store, null, null);
		_removeDrawerStoreActiveItem(store);
	} else {
		drawerItem.count--;
	}
}

/**
 * Remove the ghost element - triggered when returning an item to the drawer.
 */
function _removeDrawerStoreActiveItem(store: DrawerStore) {
	store.sticker = null;
}

/**
 * This gets triggered through '_onPointerMove' to update ghost positioning through the store callback
 * and set any hovering state.
 */
function _onDragItem(store: DrawerStore, event: MouseEvent | TouchEvent) {
	store._waitingForFrame = false;

	if (!store._updateGhostPosition) {
		return;
	}

	const pointer = getPointerPosition(store, event);
	if (!pointer) {
		return;
	}

	store._updateGhostPosition({
		left: pointer.x - store.stickerSize / 2,
		top: pointer.y - store.stickerSize / 2,
	});

	if (pointer.clientY > window.innerHeight - store.drawerHeight) {
		store.isHoveringDrawer = true;
	} else {
		store.isHoveringDrawer = false;
	}

	const layer = store.activeLayer;
	const target = getCollidingStickerTarget(layer, pointer.x, pointer.y);
	if (target && !store.isHoveringDrawer) {
		layer.hoveredTarget = target;
	} else if (layer.hoveredTarget) {
		layer.hoveredTarget = null;
	}
}

/**
 * 'Move' events for both mouse and touch.
 */
const _onPointerMove = (store: DrawerStore) => (event: MouseEvent | TouchEvent) => {
	if (!store._waitingForFrame) {
		store._waitingForFrame = true;
		window.requestAnimationFrame(() => _onDragItem(store, event));
	}
};

/**
 * 'Up' or 'End' events for both mouse and touch.
 */
const _onPointerUp = (store: DrawerStore) => (event: MouseEvent | TouchEvent) => {
	if (store.isHoveringDrawer && store.sticker) {
		alterDrawerStoreItemCount(store, store.sticker, true);
		_removeEventListeners(store);
		return;
	}

	const pointer = getPointerPosition(store, event);
	if (!pointer) {
		return;
	}

	const target = getCollidingStickerTarget(store.activeLayer, pointer.x, pointer.y);
	if (target) {
		target.onPlaceDrawerSticker(pointer);
	} else if (store.sticker) {
		alterDrawerStoreItemCount(store, store.sticker, true);
	}

	_removeEventListeners(store);
};

/**
 * Set the 'isDragging' field of the DrawerStore, as well as add/remove classes
 * from the document body.
 */
function _setDraggingState(store: DrawerStore, isDragging: boolean) {
	if (!store.sticker) {
		store.isDragging = false;
	} else {
		store.isDragging = isDragging;
	}
}

/**
 * Add the required 'mouse[move/up]' and 'touch[move/end]' event listeners to the window.
 */
function _addEventListeners(
	store: DrawerStore,
	onPointerMove: (event: MouseEvent | TouchEvent) => void,
	onPointerUp: (event: MouseEvent | TouchEvent) => void
) {
	store._onPointerMove = onPointerMove;
	store._onPointerUp = onPointerUp;

	window.addEventListener('mousemove', onPointerMove);
	window.addEventListener('mouseup', onPointerUp);
	window.addEventListener('touchmove', onPointerMove);
	window.addEventListener('touchend', onPointerUp);
}

/**
 * Remove any event listeners that were added to the window.
 */
function _removeEventListeners(store: DrawerStore) {
	_setDraggingState(store, false);

	if (store._onPointerMove) {
		window.removeEventListener('mousemove', store._onPointerMove);
		window.removeEventListener('touchmove', store._onPointerMove);
	}

	if (store._onPointerUp) {
		window.removeEventListener('mouseup', store._onPointerUp);
		window.removeEventListener('touchend', store._onPointerUp);
	}

	store._onPointerMove = null;
	store._onPointerUp = null;
}

export interface PointerPosition {
	x: number;
	y: number;
	clientX: number;
	clientY: number;
}

export function getPointerPosition(
	store: DrawerStore,
	event: MouseEvent | TouchEvent
): null | PointerPosition {
	// If the active layer is within a scroller, we need to remove both the
	// document scroll offset from the pointer position as well as the current
	// scroller's offset. That'll convert it from page X/Y into the layer's X/Y.
	const layer = store.activeLayer;
	let scrollTop = 0;
	let scrollLeft = 0;
	if (layer.scroller) {
		scrollTop = document.documentElement.scrollTop;
		scrollTop -= layer.scroller.scrollElement?.scrollTop ?? 0;

		scrollLeft = document.documentElement.scrollLeft;
		scrollLeft -= layer.scroller.scrollElement?.scrollLeft ?? 0;
	}

	const pointerEvent = getPointerEvent(event);
	if (!pointerEvent) {
		return null;
	}

	const { pageX, pageY, clientX, clientY } = pointerEvent;
	return { x: pageX - scrollLeft, y: pageY - scrollTop, clientX, clientY };
}

function getPointerEvent(event: MouseEvent | TouchEvent): null | MouseEvent | Touch {
	if (typeof window.TouchEvent !== 'undefined' && event instanceof TouchEvent) {
		return event.changedTouches[0];
	} else if (event instanceof MouseEvent) {
		return event;
	}
	return null;
}
