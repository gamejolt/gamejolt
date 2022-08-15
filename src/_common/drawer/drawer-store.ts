import {
	computed,
	inject,
	InjectionKey,
	provide,
	ref,
	shallowReactive,
	shallowRef,
	toRaw,
} from 'vue';
import { arrayRemove, numberSort } from '../../utils/array';
import { Analytics } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { showErrorGrowl } from '../growls/growls.service';
import { setModalBodyWrapper } from '../modal/modal.service';
import {
	getCollidingStickerTarget,
	StickerLayerController,
} from '../sticker/layer/layer-controller';
import AppStickerLayer from '../sticker/layer/layer.vue';
import { StickerPlacement } from '../sticker/placement/placement.model';
import { Sticker, StickerStack } from '../sticker/sticker.model';
import {
	addStickerToTarget,
	getStickerModelResourceName,
	StickerTargetController,
} from '../sticker/target/target-controller';
import { ValidStickerResource } from '../sticker/target/target.vue';
import { EventTopic } from '../system/event/event-topic';
import { $gettext } from '../translate/translate.service';

const DrawerStoreKey: InjectionKey<DrawerStore> = Symbol('drawer-store');

interface StickerStreak {
	sticker: Sticker;
	count: number;
}

export type DrawerStore = ReturnType<typeof createDrawerStore>;

export function createDrawerStore() {
	const layers = shallowReactive<StickerLayerController[]>([]);
	const targetController = shallowRef<StickerTargetController | null>(null);

	const drawerItems = shallowRef<StickerStack[]>([]);
	const placedItem = shallowRef<StickerPlacement | null>(null);
	const sticker = shallowRef<Sticker | null>(null);
	const streak = shallowRef<StickerStreak | null>(null);

	const drawerHeight = ref(0);
	const stickerSize = ref(64);
	const stickerCurrency = ref<number | null>(null);
	const stickerCost = ref<number | null>(null);

	const isDrawerOpen = ref(false);
	const isDragging = ref(false);
	const isHoveringDrawer = ref(false);
	const isLoading = ref(false);
	const hasLoaded = ref(false);
	const hasValidTarget = ref(false);
	const hideDrawer = ref(false);

	const _waitingForFrame = ref(false);
	const _onPointerMove = shallowRef<((event: MouseEvent | TouchEvent) => void) | null>(null);
	const _onPointerUp = shallowRef<((event: MouseEvent | TouchEvent) => void) | null>(null);
	const _updateGhostPosition = shallowRef<
		((position: { left: number; top: number }) => void) | null
	>(null);

	const activeLayer = computed(() => {
		return layers[layers.length - 1];
	});

	// Set up modals to have the sticker layer as their layer element.
	setModalBodyWrapper(AppStickerLayer);

	const c = {
		layers,
		drawerItems,
		targetController,
		placedItem,
		sticker,
		drawerHeight,
		stickerSize,
		stickerCurrency,
		stickerCost,
		streak,
		isDrawerOpen,
		isDragging,
		isHoveringDrawer,
		isLoading,
		hasLoaded,
		hasValidTarget,
		hideDrawer,
		_waitingForFrame,
		_onPointerMove,
		_onPointerUp,
		_updateGhostPosition,
		activeLayer,
	};
	provide(DrawerStoreKey, c);
	return c;
}

export function useDrawerStore() {
	return inject(DrawerStoreKey)!;
}

export function setStickerStreak(store: DrawerStore, sticker: Sticker, count: number) {
	store.streak.value = {
		sticker,
		count,
	};
}

/**
 * Toggle the shell drawer, initializing the state when opening or resetting it
 * when closing.
 */
export function setDrawerOpen(store: DrawerStore, isOpen: boolean) {
	if (isOpen === store.isDrawerOpen.value) {
		return;
	}

	if (isOpen) {
		store.isDrawerOpen.value = true;
		_initializeDrawerContent(store);
	} else {
		_resetDrawerStore(store);
	}
}

export function setDrawerHidden(store: DrawerStore, shouldHide: boolean) {
	store.hideDrawer.value = shouldHide;

	// Everytime we un-hide the drawer we want to fetch their new stickers since they may have unlocked more.
	if (!shouldHide) {
		_initializeDrawerContent(store);
	}
}

/**
 * Send an API request to get the user stickers.
 */
async function _initializeDrawerContent(store: DrawerStore) {
	store.isLoading.value = true;
	const payload = await Api.sendRequest('/web/stickers/dash');

	store.stickerCost.value = payload.stickerCost;
	store.stickerCurrency.value = payload.balance;

	const eventStickers: StickerStack[] = [];
	const generalStickers: StickerStack[] = [];

	payload.stickerCounts.forEach((stickerCountPayload: any) => {
		const stickerData = payload.stickers.find(
			(i: Sticker) => i.id === stickerCountPayload.sticker_id
		);

		const stickerCount = {
			count: stickerCountPayload.count,
			sticker_id: stickerCountPayload.sticker_id,
			sticker: new Sticker(stickerData),
		} as StickerStack;

		if (stickerCount.sticker.is_event) {
			eventStickers.push(stickerCount);
		} else {
			generalStickers.push(stickerCount);
		}
	});

	const lists = [eventStickers, generalStickers];
	lists.forEach(i => i.sort((a, b) => numberSort(b.sticker.rarity, a.sticker.rarity)));

	store.drawerItems.value = lists.flat();
	store.isLoading.value = false;
	store.hasLoaded.value = true;
}

/**
 * Reset the DrawerStore state to their initial values. Will also close the
 * drawer.
 */
function _resetDrawerStore(store: DrawerStore) {
	_removeEventListeners(store);
	_removeDrawerStoreActiveItem(store);

	store.targetController.value = null;
	store.placedItem.value = null;
	store.isDrawerOpen.value = false;
	store.hasValidTarget.value = false;
	store.isHoveringDrawer.value = false;
	store.drawerHeight.value = 0;
	store.hideDrawer.value = false;

	store._waitingForFrame.value = false;
	store._updateGhostPosition.value = null;

	store.activeLayer.value.hoveredTarget.value = null;
}

export function registerStickerLayer(store: DrawerStore, layer: StickerLayerController) {
	store.layers.push(layer);
}

export function unregisterStickerLayer(store: DrawerStore, layer: StickerLayerController) {
	arrayRemove(store.layers, i => toRaw(i) === toRaw(layer));
}

export function setDrawerStoreHeight(store: DrawerStore, height: number) {
	store.drawerHeight.value = height;
}

export function assignDrawerStoreGhostCallback(
	store: DrawerStore,
	callback: (pos: { left: number; top: number }) => void
) {
	store._updateGhostPosition.value = callback;
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
	if (fromTarget) {
		assignDrawerStoreItem(store, null, null);
	}

	if (!sticker || !event) {
		return;
	}

	if (!store.sticker.value) {
		store.sticker.value = sticker;

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
	store.placedItem.value = item;
	store.targetController.value = controller;
}

interface StickerPlacementPayloadData {
	stickerId: number;
	positionX: number;
	positionY: number;
	rotation: number;
	resource: ValidStickerResource;
	resourceId: number;
}

export type CustomStickerPlacementRequest = (data: StickerPlacementPayloadData) => Promise<any>;

export const onFiresideStickerPlaced = new EventTopic<StickerPlacement>();

export async function commitDrawerStoreItemPlacement(store: DrawerStore) {
	const {
		placedItem: { value: sticker },
		targetController,
	} = store;

	if (!sticker || !targetController.value) {
		return;
	}

	Analytics.trackEvent('stickers', 'place-sticker');

	const { model, placeStickerCallback } = targetController.value;
	const resourceType = getStickerModelResourceName(model);

	const body = {
		stickerId: sticker.sticker.id,
		positionX: sticker.position_x,
		positionY: sticker.position_y,
		rotation: sticker.rotation,
		resource: resourceType,
		resourceId: model.id,
	};

	const promise = placeStickerCallback
		? placeStickerCallback(body)
		: Api.sendRequest('/web/stickers/place', body, { detach: true });

	const { success, resource, parent: payloadParent, stickerPlacement } = await promise;

	if (success) {
		addStickerToTarget(targetController.value, new StickerPlacement(stickerPlacement));

		model.assign(resource);
		const { parent } = targetController.value;

		if (payloadParent && parent) {
			parent.model.assign(payloadParent);
		}

		setDrawerOpen(store, false);
	} else {
		showErrorGrowl($gettext(`Failed to place sticker.`));
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
	const drawerItem = store.drawerItems.value.find(i => {
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
	store.sticker.value = null;
}

/**
 * This gets triggered through '_onPointerMove' to update ghost positioning through the store callback
 * and set any hovering state.
 */
function _onDragItem(store: DrawerStore, event: MouseEvent | TouchEvent) {
	store._waitingForFrame.value = false;

	if (!store._updateGhostPosition.value) {
		return;
	}

	const pointer = getPointerPosition(store, event);
	if (!pointer) {
		return;
	}

	const stickerSize = store.stickerSize.value;

	store._updateGhostPosition.value({
		left: pointer.x - stickerSize / 2,
		top: pointer.y - stickerSize / 2,
	});

	const drawerTop = store.isHoveringDrawer.value
		? window.innerHeight - store.drawerHeight.value
		: window.innerHeight - stickerSize;

	if (pointer.clientY > drawerTop) {
		store.isHoveringDrawer.value = true;
	} else {
		store.isHoveringDrawer.value = false;
	}

	const layer = store.activeLayer.value;
	const target = getCollidingStickerTarget(layer, pointer.x, pointer.y);
	if (target && !store.isHoveringDrawer.value) {
		layer.hoveredTarget.value = target;
	} else if (layer.hoveredTarget.value) {
		layer.hoveredTarget.value = null;
	}
}

/**
 * 'Move' events for both mouse and touch.
 */
const _onPointerMove = (store: DrawerStore) => (event: MouseEvent | TouchEvent) => {
	if (!store._waitingForFrame.value) {
		store._waitingForFrame.value = true;
		window.requestAnimationFrame(() => _onDragItem(store, event));
	}

	// Older iOS devices seem to need this. It will prevent scrolling while dragging a ghost item around the page.
	event.preventDefault();
};

/**
 * 'Up' or 'End' events for both mouse and touch.
 */
const _onPointerUp = (store: DrawerStore) => (event: MouseEvent | TouchEvent) => {
	const { isHoveringDrawer, sticker, activeLayer } = store;

	if (isHoveringDrawer.value && sticker.value) {
		Analytics.trackEvent('sticker-drawer', 'drop-drawer');
		alterDrawerStoreItemCount(store, sticker.value, true);
		_removeEventListeners(store);
		return;
	}

	const pointer = getPointerPosition(store, event);
	if (!pointer) {
		return;
	}

	const target = getCollidingStickerTarget(activeLayer.value, pointer.x, pointer.y);
	if (target) {
		Analytics.trackEvent('sticker-drawer', 'drop-target');
		target.onPlaceDrawerSticker(pointer);
	} else if (sticker.value) {
		Analytics.trackEvent('sticker-drawer', 'drop-mask');
		alterDrawerStoreItemCount(store, sticker.value, true);
	}

	_removeEventListeners(store);
};

/**
 * Set the 'isDragging' field of the DrawerStore, as well as add/remove classes
 * from the document body.
 */
function _setDraggingState(store: DrawerStore, isDragging: boolean) {
	if (!store.sticker.value) {
		store.isDragging.value = false;
	} else {
		store.isDragging.value = isDragging;
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
	store._onPointerMove.value = onPointerMove;
	store._onPointerUp.value = onPointerUp;

	window.addEventListener('mousemove', onPointerMove, {
		passive: false,
	});
	window.addEventListener('touchmove', onPointerMove, {
		passive: false,
	});
	window.addEventListener('mouseup', onPointerUp);
	window.addEventListener('touchend', onPointerUp);
}

/**
 * Remove any event listeners that were added to the window.
 */
function _removeEventListeners(store: DrawerStore) {
	_setDraggingState(store, false);

	if (store._onPointerMove.value) {
		window.removeEventListener('mousemove', store._onPointerMove.value);
		window.removeEventListener('touchmove', store._onPointerMove.value);
	}

	if (store._onPointerUp.value) {
		window.removeEventListener('mouseup', store._onPointerUp.value);
		window.removeEventListener('touchend', store._onPointerUp.value);
	}

	store._onPointerMove.value = null;
	store._onPointerUp.value = null;
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
	const layer = store.activeLayer.value;
	const scroller = layer.scroller.value;

	let scrollTop = 0;
	let scrollLeft = 0;
	if (scroller) {
		scrollTop = document.documentElement.scrollTop;
		scrollTop -= scroller.element.value?.scrollTop ?? 0;

		scrollLeft = document.documentElement.scrollLeft;
		scrollLeft -= scroller.element.value?.scrollLeft ?? 0;
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
