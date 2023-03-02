import { computed, inject, InjectionKey, Ref, ref, shallowReactive, shallowRef, toRaw } from 'vue';
import { arrayRemove, numberSort } from '../../utils/array';
import { Analytics } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { Comment } from '../comment/comment-model';
import { Fireside } from '../fireside/fireside.model';
import { FiresidePost } from '../fireside/post/post-model';
import { showErrorGrowl } from '../growls/growls.service';
import { setModalBodyWrapper } from '../modal/modal.service';
import { EventTopic } from '../system/event/event-topic';
import { $gettext } from '../translate/translate.service';
import { User } from '../user/user.model';
import AppStickerLayer from './layer/AppStickerLayer.vue';
import { getCollidingStickerTarget, StickerLayerController } from './layer/layer-controller';
import { UserStickerPack } from './pack/user_pack.model';
import { StickerPlacement } from './placement/placement.model';
import { Sticker, StickerStack } from './sticker.model';
import { ValidStickerResource } from './target/AppStickerTarget.vue';
import {
	addStickerToTarget,
	getStickerModelResourceName,
	StickerTargetController,
} from './target/target-controller';

export const StickerStoreKey: InjectionKey<StickerStore> = Symbol('sticker-store');

interface StickerStreak {
	sticker: Sticker;
	count: number;
}

export type StickerStore = ReturnType<typeof createStickerStore>;

export function createStickerStore(options: { user: Ref<User | null> }) {
	const user = computed(() => options.user.value);
	const layers = shallowReactive<StickerLayerController[]>([]);
	const targetController = shallowRef<StickerTargetController | null>(null);

	const drawerItems = shallowRef<StickerStack[]>([]);
	const stickerPacks = ref<UserStickerPack[]>([]);

	const placedItem = shallowRef<StickerPlacement | null>(null);
	const sticker = shallowRef<Sticker | null>(null);
	const streak = shallowRef<StickerStreak | null>(null);

	const drawerHeight = ref(0);
	const stickerSize = ref(64);

	const currentCharge = ref(0);
	const chargeLimit = ref(7);

	/**
	 * NOTE: If {@link currentCharge} is greater or equal to this, it doesn't
	 * mean we can charge a sticker. This is only used to change UI while
	 * placing a charged sticker.
	 */
	const chargeCost = ref(2);

	const isChargingSticker = ref(false);

	const isDrawerOpen = ref(false);
	const isDragging = ref(false);
	const isHoveringDrawer = ref(false);
	const isLoading = ref(false);
	const hasLoaded = ref(false);
	const hideDrawer = ref(false);

	const _waitingForFrame = ref(false);
	const _onPointerMove = shallowRef<((event: MouseEvent | TouchEvent) => void) | null>(null);
	const _onPointerUp = shallowRef<((event: MouseEvent | TouchEvent) => void) | null>(null);
	const _updateGhostPosition = shallowRef<
		((position: { left: number; top: number }) => void) | null
	>(null);

	const activeLayer = shallowRef<StickerLayerController | null>(null);

	const shouldShowCharge = computed(() => isLayerOrTargetCreatorResource.value);

	function _isTargetMine(controller: StickerTargetController): boolean {
		return isStickerTargetMine(c, controller);
	}

	/// Checks the [AppStickerTargetController] of either our [activeLayer] or
	/// [placedSticker] to determine if we're placing on the resource of a
	/// [UserModel] that is a creator.
	///
	/// Returns `false` if this is our own resource (can't place charged
	/// stickers on your own content.)
	const isLayerOrTargetCreatorResource = computed(() => {
		const layer = activeLayer.value;
		if (!layer) {
			return false;
		}

		if (targetController.value) {
			return targetController.value.isCreator.value && !_isTargetMine(targetController.value);
		}

		return layer.isAllCreator.value;
	});

	const canChargeSticker = computed(() => currentCharge.value >= chargeLimit.value);
	const canPlaceChargedStickerOnResource = computed(
		() => canChargeSticker.value && isLayerOrTargetCreatorResource.value
	);

	function setChargeData({
		charge,
		max,
		cost,
	}: {
		charge?: number;
		max?: number;
		cost?: number;
	}) {
		if (charge !== undefined) {
			currentCharge.value = charge;
		}
		if (max !== undefined) {
			chargeLimit.value = max;
		}
		if (cost !== undefined) {
			chargeCost.value = cost;
		}
	}

	// Set up modals to have the sticker layer as their layer element.
	setModalBodyWrapper(AppStickerLayer);

	const c = {
		layers,
		drawerItems,
		stickerPacks,
		targetController,
		placedItem,
		sticker,
		drawerHeight,
		stickerSize,
		currentCharge,
		chargeLimit,
		chargeCost,
		isChargingSticker,
		streak,
		isDrawerOpen,
		isDragging,
		isHoveringDrawer,
		isLoading,
		hasLoaded,
		hideDrawer,
		_waitingForFrame,
		_onPointerMove,
		_onPointerUp,
		_updateGhostPosition,
		activeLayer,
		shouldShowCharge,
		isLayerOrTargetCreatorResource,
		canChargeSticker,
		canPlaceChargedStickerOnResource,
		setChargeData,
		user,
	};
	return c;
}

export function isStickerTargetMine(store: StickerStore, target: StickerTargetController | null) {
	const { user, placedItem } = store;
	const myUserId = user.value?.id;

	let tempController = target;
	let isMine = false;

	do {
		const model = toRaw(tempController?.model);
		if (model instanceof FiresidePost) {
			isMine = model.displayUser.id === myUserId;
		} else if (model instanceof Fireside) {
			isMine = placedItem.value?.target_data.host_user_id === myUserId;
		} else if (model instanceof Comment) {
			isMine = model.user.id === myUserId;
		}

		if (isMine) {
			break;
		}

		tempController = tempController?.parent.value || null;
	} while (tempController?.parent);

	return isMine;
}

export function useStickerStore() {
	return inject(StickerStoreKey)!;
}

export function setStickerStreak(store: StickerStore, sticker: Sticker, count: number) {
	store.streak.value = {
		sticker,
		count,
	};
}

/**
 * Toggle the shell drawer, initializing the state when opening or resetting it
 * when closing.
 */
export function setStickerDrawerOpen(
	store: StickerStore,
	shouldOpen: boolean,
	preferredLayer: StickerLayerController | null
) {
	const { isDrawerOpen, layers, activeLayer } = store;

	if (shouldOpen === isDrawerOpen.value) {
		return;
	}

	if (shouldOpen) {
		let _chosenLayer = preferredLayer;
		// In reverse order, check layers and use the first one that marked itself
		// as active.
		if (!_chosenLayer && layers.length > 0) {
			for (let i = layers.length; i > 0; --i) {
				const layer = layers[i - 1];
				if (layer.isActive.value) {
					_chosenLayer = layer;
					break;
				}
			}
		}

		activeLayer.value = _chosenLayer;

		isDrawerOpen.value = true;
		_initializeDrawerContent(store);
	} else {
		_resetStickerStore(store);
	}
}

export function setStickerDrawerHidden(store: StickerStore, shouldHide: boolean) {
	store.hideDrawer.value = shouldHide;

	// Everytime we un-hide the drawer we want to fetch their new stickers since they may have unlocked more.
	if (!shouldHide) {
		_initializeDrawerContent(store);
	}
}

/**
 * Send an API request to get the user stickers.
 */
async function _initializeDrawerContent(store: StickerStore) {
	const { isLoading, drawerItems, hasLoaded, setChargeData } = store;

	isLoading.value = true;
	const payload = await Api.sendRequest('/web/stickers/dash');

	setChargeData({
		charge: payload.currentCharge,
		max: payload.maxCharge,
		cost: payload.chargeCost,
	});

	drawerItems.value = getStickerCountsFromPayloadData({
		stickerCounts: payload.stickerCounts,
		stickers: payload.stickers,
	}).flat();
	isLoading.value = false;
	hasLoaded.value = true;
}

/**
 * Returns sorted lists of stickers. Provide {@link newStickerIds} to sort new
 * stickers to the top of their lists.
 *
 * Call `.flat()` on the result to flatten to a single list.
 *
 * ```
 * const result: [
 *          eventStickers: StickerStack[],
 *          generalStickers: StickerStack[]
 *      ];
 * ```
 */
export function getStickerCountsFromPayloadData({
	stickerCounts,
	stickers,
	newStickerIds,
}: {
	stickerCounts: any[];
	stickers: any[];
	newStickerIds?: number[];
}) {
	const eventStickers: StickerStack[] = [];
	const generalStickers: StickerStack[] = [];

	stickerCounts.forEach((stickerCountPayload: any) => {
		const stickerData = stickers.find((i: Sticker) => i.id === stickerCountPayload.sticker_id);

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

	return sortStickerCounts({
		eventStickers,
		generalStickers,
		newStickerIds,
	});
}

/**
 * Sorts stickers in place. Moves "new" stickers to the start of their parent
 * array.
 */
export function sortStickerCounts({
	eventStickers,
	generalStickers,
	newStickerIds,
}: {
	eventStickers: StickerStack[];
	generalStickers: StickerStack[];
	newStickerIds?: number[];
}) {
	const lists = [eventStickers, generalStickers];
	lists.forEach(list => {
		list.sort((a, b) => numberSort(b.sticker.rarity, a.sticker.rarity));

		// Sort all "new" stickers to the top of their groups.
		if (newStickerIds && newStickerIds.length > 0) {
			const newStickers = list.filter(x => newStickerIds.includes(x.sticker_id));
			list = list.filter(x => !newStickers.includes(x));
			list.unshift(...newStickers);
		}
	});
	return lists;
}

/**
 * Reset the {@link StickerStore} state to their initial values. Will also close the
 * drawer.
 */
function _resetStickerStore(store: StickerStore) {
	_removeEventListeners(store);
	_removeStickerStoreActiveItem(store);

	store.targetController.value = null;
	store.placedItem.value = null;
	store.isDrawerOpen.value = false;
	store.isHoveringDrawer.value = false;
	store.drawerHeight.value = 0;
	store.hideDrawer.value = false;

	store._waitingForFrame.value = false;
	store._updateGhostPosition.value = null;

	const { activeLayer } = store;
	if (activeLayer.value) {
		activeLayer.value.hoveredTarget.value = null;
		activeLayer.value = null;
	}
}

export function registerStickerLayer(store: StickerStore, layer: StickerLayerController) {
	store.layers.push(layer);
}

export function unregisterStickerLayer(store: StickerStore, layer: StickerLayerController) {
	arrayRemove(store.layers, i => toRaw(i) === toRaw(layer));
}

export function setStickerDrawerHeight(store: StickerStore, height: number) {
	store.drawerHeight.value = height;
}

export function assignStickerStoreGhostCallback(
	store: StickerStore,
	callback: (pos: { left: number; top: number }) => void
) {
	store._updateGhostPosition.value = callback;

	const rawCallback = toRaw(callback);
	const removeCallback = () => {
		if (rawCallback === toRaw(store._updateGhostPosition.value)) {
			store._updateGhostPosition.value = null;
		}
	};

	return removeCallback;
}

/**
 * Assign the drawer item that we want to use as a ghost item.
 */
export function setStickerStoreActiveItem(
	store: StickerStore,
	sticker: Sticker,
	event?: MouseEvent | TouchEvent,
	fromTarget?: boolean
) {
	if (fromTarget) {
		assignStickerStoreItem(store, null, null);
	}

	if (!sticker || !event) {
		return;
	}

	if (!store.sticker.value) {
		store.sticker.value = sticker;

		if (!fromTarget) {
			alterStickerStoreItemCount(store, sticker, false);
		}
	}

	_setDraggingState(store, true);
	_onDragItem(store, event);
	_addEventListeners(store, _onPointerMove(store), _onPointerUp(store));
}

/**
 * Assigns the placed item and target controller of the store.
 */
export function assignStickerStoreItem(
	store: StickerStore,
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

export async function commitStickerStoreItemPlacement(store: StickerStore) {
	const {
		placedItem: { value: sticker },
		targetController,
		canPlaceChargedStickerOnResource,
		currentCharge,
		chargeCost,
		isChargingSticker,
	} = store;

	if (!sticker || !targetController.value) {
		return;
	}

	Analytics.trackEvent('stickers', 'place-sticker');

	const { model, placeStickerCallback } = targetController.value;
	const resourceType = getStickerModelResourceName(model);

	const isCharged = canPlaceChargedStickerOnResource.value && isChargingSticker.value;

	const body = {
		stickerId: sticker.sticker.id,
		positionX: sticker.position_x,
		positionY: sticker.position_y,
		rotation: sticker.rotation,
		resource: resourceType,
		resourceId: model.id,
		isCharged,
	};

	try {
		const promise = placeStickerCallback
			? placeStickerCallback(body)
			: Api.sendRequest('/web/stickers/place', body, { detach: true });

		const payload = await promise;
		const { success, resource, parent: payloadParent, stickerPlacement } = payload;
		if (success === false) {
			throw payload;
		}

		addStickerToTarget(targetController.value, new StickerPlacement(stickerPlacement));

		model.assign(resource);
		const { parent } = targetController.value;

		if (payloadParent && parent.value) {
			parent.value.model.assign(payloadParent);
		}

		setStickerDrawerOpen(store, false, null);

		// Update our sticker charge after a successful placement.
		if (isCharged) {
			currentCharge.value = Math.max(0, currentCharge.value - chargeCost.value);
		}
	} catch (e) {
		console.error(e);
		setStickerDrawerOpen(store, false, null);
		showErrorGrowl($gettext(`Failed to place sticker.`));
	}

	isChargingSticker.value = false;
}

/**
 * Add or subtract from the drawer item count
 */
export function alterStickerStoreItemCount(
	store: StickerStore,
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
		assignStickerStoreItem(store, null, null);
		_removeStickerStoreActiveItem(store);
	} else {
		drawerItem.count--;
	}
}

/**
 * Remove the ghost element - triggered when returning an item to the drawer.
 */
function _removeStickerStoreActiveItem(store: StickerStore) {
	store.sticker.value = null;
	store.isChargingSticker.value = false;
}

/**
 * This gets triggered through '_onPointerMove' to update ghost positioning through the store callback
 * and set any hovering state.
 */
function _onDragItem(store: StickerStore, event: MouseEvent | TouchEvent) {
	const {
		_waitingForFrame,
		_updateGhostPosition,
		stickerSize,
		isHoveringDrawer,
		drawerHeight,
		activeLayer,
	} = store;

	_waitingForFrame.value = false;

	if (!_updateGhostPosition.value) {
		return;
	}

	const pointer = getPointerPosition(store, event);
	if (!pointer) {
		return;
	}

	const size = stickerSize.value;

	_updateGhostPosition.value({
		left: pointer.x - size / 2,
		top: pointer.y - size / 2,
	});

	const drawerTop = isHoveringDrawer.value
		? window.innerHeight - drawerHeight.value
		: window.innerHeight - size;

	if (pointer.clientY > drawerTop) {
		isHoveringDrawer.value = true;
	} else {
		isHoveringDrawer.value = false;
	}

	const layer = activeLayer.value;
	if (!layer) {
		return;
	}

	const target = getCollidingStickerTarget(layer, pointer.x, pointer.y);
	if (target && !isHoveringDrawer.value) {
		layer.hoveredTarget.value = target;
	} else if (layer.hoveredTarget.value) {
		layer.hoveredTarget.value = null;
	}
}

/**
 * 'Move' events for both mouse and touch.
 */
const _onPointerMove = (store: StickerStore) => (event: MouseEvent | TouchEvent) => {
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
const _onPointerUp = (store: StickerStore) => (event: MouseEvent | TouchEvent) => {
	const { isHoveringDrawer, sticker, activeLayer } = store;

	if (isHoveringDrawer.value && sticker.value) {
		Analytics.trackEvent('sticker-drawer', 'drop-drawer');
		alterStickerStoreItemCount(store, sticker.value, true);
		_removeEventListeners(store);
		return;
	}

	const pointer = getPointerPosition(store, event);
	if (!pointer) {
		return;
	}

	const target = activeLayer.value
		? getCollidingStickerTarget(activeLayer.value!, pointer.x, pointer.y)
		: null;

	if (target) {
		Analytics.trackEvent('sticker-drawer', 'drop-target');
		target.onPlaceDrawerSticker(pointer);
	} else if (sticker.value) {
		Analytics.trackEvent('sticker-drawer', 'drop-mask');
		alterStickerStoreItemCount(store, sticker.value, true);
	}

	_removeEventListeners(store);
};

/**
 * Set the 'isDragging' field of the {@link StickerStore}, as well as add/remove classes
 * from the document body.
 */
function _setDraggingState(store: StickerStore, isDragging: boolean) {
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
	store: StickerStore,
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
function _removeEventListeners(store: StickerStore) {
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
	store: StickerStore,
	event: MouseEvent | TouchEvent
): null | PointerPosition {
	// If the active layer is within a scroller, we need to remove both the
	// document scroll offset from the pointer position as well as the current
	// scroller's offset. That'll convert it from page X/Y into the layer's X/Y.
	const layer = store.activeLayer.value;
	if (!layer) {
		return null;
	}

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
