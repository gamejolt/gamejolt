import { computed, inject, InjectionKey, Ref, ref, shallowReactive, shallowRef, toRaw } from 'vue';
import { arrayRemove, numberSort } from '../../utils/array';
import { Api } from '../api/api.service';
import { FiresidePostModel } from '../fireside/post/post-model';
import { showErrorGrowl } from '../growls/growls.service';
import { setModalBodyWrapper } from '../modal/modal.service';
import { storeModel, storeModelList } from '../model/model-store.service';
import { ModelData } from '../model/model.service';
import { $gettext } from '../translate/translate.service';
import { UserModel } from '../user/user.model';
import AppStickerLayer from './layer/AppStickerLayer.vue';
import { getCollidingStickerTarget, StickerLayerController } from './layer/layer-controller';
import { UserStickerPackModel } from './pack/user-pack.model';
import { StickerPlacementModel } from './placement/placement.model';
import { StickerCount } from './sticker-count';
import { StickerModel, StickerStack } from './sticker.model';
import { ValidStickerResource } from './target/AppStickerTarget.vue';
import {
	addStickerToTarget,
	getStickerModelResourceName,
	StickerTargetController,
} from './target/target-controller';

export const StickerStoreKey: InjectionKey<StickerStore> = Symbol('sticker-store');

interface StickerStreak {
	sticker: StickerModel;
	count: number;
}

export type CreatorStickersMap = Map<number, CreatorStickersList>;
export type CreatorStickersList = StickerStack[];

export type StickerStore = ReturnType<typeof createStickerStore>;

export function createStickerStore(options: { user: Ref<UserModel | null> }) {
	const user = computed(() => options.user.value);
	const layers = shallowReactive<StickerLayerController[]>([]);
	const targetController = shallowRef<StickerTargetController | null>(null);

	const eventStickers = ref([]) as Ref<CreatorStickersList>;
	const creatorStickers = ref<CreatorStickersMap>(new Map());
	const generalStickers = ref([]) as Ref<CreatorStickersList>;

	const stickerPacks = ref([]) as Ref<UserStickerPackModel[]>;

	const placedItem = shallowRef<StickerPlacementModel | null>(null);
	const sticker = shallowRef<StickerModel | null>(null);
	const streak = shallowRef<StickerStreak | null>(null);

	const allStickers = computed(() =>
		[eventStickers.value, ...creatorStickers.value.values(), generalStickers.value].flat()
	);

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

	const _waitingForFrame = ref(false);
	const _onPointerMove = shallowRef<((event: MouseEvent | TouchEvent) => void) | null>(null);
	const _onPointerUp = shallowRef<((event: MouseEvent | TouchEvent) => void) | null>(null);
	const _updateGhostPosition = shallowRef<
		((position: { left: number; top: number }) => void) | null
	>(null);

	const activeLayer = shallowRef<StickerLayerController | null>(null);

	const shouldShowCharge = computed(() => isLayerOrTargetChargeableResource.value);

	function _isTargetMine(controller: StickerTargetController): boolean {
		return isStickerTargetMine(c, controller);
	}

	/// Checks the [AppStickerTargetController] of either our [activeLayer] or
	/// [placedSticker] to determine if the resource can receive charged
	/// stickers.
	///
	/// Returns `false` if this is our own resource (can't place charged
	/// stickers on your own content.)
	const isLayerOrTargetChargeableResource = computed(() => {
		const layer = activeLayer.value;
		if (!layer) {
			return false;
		}

		if (targetController.value) {
			return (
				targetController.value.canReceiveCharge.value &&
				!_isTargetMine(targetController.value)
			);
		}

		return layer.canChargeAllTargets.value;
	});

	const canChargeSticker = computed(() => currentCharge.value >= chargeLimit.value);
	const canPlaceChargedStickerOnResource = computed(
		() => canChargeSticker.value && isLayerOrTargetChargeableResource.value
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
		eventStickers,
		creatorStickers,
		generalStickers,
		allStickers,
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
		_waitingForFrame,
		_onPointerMove,
		_onPointerUp,
		_updateGhostPosition,
		activeLayer,
		shouldShowCharge,
		isLayerOrTargetChargeableResource,
		canChargeSticker,
		canPlaceChargedStickerOnResource,
		setChargeData,
		user,
	};
	return c;
}

export function isStickerTargetMine(store: StickerStore, target: StickerTargetController | null) {
	const { user } = store;
	const myUserId = user.value?.id;

	let tempController = target;
	let isMine = false;

	do {
		const model = toRaw(tempController?.model);
		if (model instanceof FiresidePostModel) {
			isMine = model.displayUser.id === myUserId;
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

export function setStickerStreak(store: StickerStore, sticker: StickerModel, count: number) {
	store.streak.value = {
		sticker,
		count,
	};
}

export function openStickerDrawer(store: StickerStore, layer: StickerLayerController) {
	const { isDrawerOpen, activeLayer } = store;
	if (isDrawerOpen.value) {
		return;
	}

	activeLayer.value = layer;

	isDrawerOpen.value = true;
	_initializeDrawerContent(store, layer);
}

export function closeStickerDrawer(store: StickerStore) {
	const { isDrawerOpen } = store;
	if (!isDrawerOpen.value) {
		return;
	}

	_resetStickerStore(store);
}

/**
 * Send an API request to get the user stickers.
 */
async function _initializeDrawerContent(store: StickerStore, layer: StickerLayerController) {
	const { isLoading, hasLoaded, setChargeData, eventStickers, creatorStickers, generalStickers } =
		store;

	isLoading.value = true;

	const layerItem = layer.layerItems.value.find(i => i.controller.children.value.length === 0);
	if (!layerItem) {
		throw new Error('Could not find a primary sticker controller for the given layer.');
	}

	const { model } = layerItem.controller;
	const resourceType = getStickerModelResourceName(model);
	const payload = await Api.sendRequest(`/web/stickers/placeable/${resourceType}/${model.id}`);

	setChargeData({
		charge: payload.currentCharge,
		max: payload.maxCharge,
		cost: payload.chargeCost,
	});

	const data = getStickerStacksFromPayloadData({
		stickerCounts: payload.stickerCounts,
		stickers: payload.stickers,
		unownedStickerMasteries: null,
	});

	eventStickers.value = data.eventStickers;
	creatorStickers.value = data.creatorStickers;
	generalStickers.value = data.generalStickers;

	isLoading.value = false;
	hasLoaded.value = true;
}

interface SortedStickerStacks {
	eventStickers: CreatorStickersList;
	creatorStickers: CreatorStickersMap;
	generalStickers: CreatorStickersList;
}

export enum StickerSortMethod {
	rarity = 'Rarity',
	mastery = 'Mastery',
}

/**
 * Returns sorted lists of stickers.
 * ```
 */
export function getStickerStacksFromPayloadData({
	stickerCounts,
	stickers,
	unownedStickerMasteries,
	sorting,
}: {
	stickerCounts: ModelData<StickerCount>[];
	stickers: ModelData<StickerModel>[];
	unownedStickerMasteries: ModelData<StickerModel>[] | null | undefined;
	sorting?: StickerSortMethod;
}): SortedStickerStacks {
	const eventStickers: CreatorStickersList = [];
	const creatorStickers: CreatorStickersMap = new Map();
	const generalStickers: CreatorStickersList = [];

	const unownedMasteries = storeModelList(StickerModel, unownedStickerMasteries || []);

	const addItemToList = (item: StickerStack) => {
		const stickerCreator = item.sticker.owner_user;

		if (item.sticker.isCreatorSticker && stickerCreator) {
			if (creatorStickers.has(stickerCreator.id)) {
				creatorStickers.get(stickerCreator.id)!.push(item);
			} else {
				creatorStickers.set(stickerCreator.id, [item]);
			}
		} else if (item.sticker.is_event) {
			eventStickers.push(item);
		} else {
			generalStickers.push(item);
		}
	};

	stickerCounts.forEach((stickerCountPayload: any) => {
		const stickerData = stickers.find(
			(i: ModelData<StickerModel>) => i.id === stickerCountPayload.sticker_id
		);
		if (!stickerData) {
			return;
		}

		const item: StickerStack = {
			count: stickerCountPayload.count,
			sticker_id: stickerCountPayload.sticker_id,
			sticker: storeModel(StickerModel, stickerData),
		};

		addItemToList(item);
	});

	unownedMasteries.forEach(sticker => {
		const item: StickerStack = {
			count: null,
			sticker_id: sticker.id,
			sticker,
		};

		addItemToList(item);
	});

	return sortStickerStacks({
		eventStickers,
		creatorStickers,
		generalStickers,
		sorting,
	});
}

/**
 * Sorts stickers in place.
 */
export function sortStickerStacks({
	eventStickers,
	creatorStickers,
	generalStickers,
	sorting = StickerSortMethod.rarity,
}: {
	eventStickers: CreatorStickersList;
	creatorStickers: CreatorStickersMap;
	generalStickers: CreatorStickersList;
	sorting?: StickerSortMethod;
}): SortedStickerStacks {
	const lists = [eventStickers, ...creatorStickers.values(), generalStickers];

	lists.forEach(list => {
		switch (sorting) {
			case StickerSortMethod.rarity:
				list.sort((a, b) => {
					const aCount = a.count ?? 0;
					const bCount = b.count ?? 0;
					const aMastery = a.sticker.mastery;
					const bMastery = b.sticker.mastery;

					// If this sticker has no count, compare by mastery. Sort
					// items nearest to completion to the front.
					if (
						aCount <= 0 &&
						bCount <= 0 &&
						typeof aMastery === 'number' &&
						typeof bMastery === 'number'
					) {
						return numberSort(bMastery, aMastery);
					}

					if (aCount <= 0 || bCount <= 0) {
						return numberSort(bCount, aCount);
					}

					const aRarity = a.sticker.rarity;
					const bRarity = b.sticker.rarity;
					return numberSort(bRarity, aRarity);
				});
				break;

			case StickerSortMethod.mastery:
				list.sort((a, b) => {
					const aMastery = a.sticker.mastery;
					const bMastery = b.sticker.mastery;
					const aIsNumber = typeof aMastery === 'number';
					const bIsNumber = typeof bMastery === 'number';

					if (aIsNumber && !bIsNumber) {
						return -1;
					} else if (!aIsNumber && bIsNumber) {
						return 1;
					} else if (aIsNumber && bIsNumber) {
						return numberSort(bMastery, aMastery);
					}

					const aRarity = a.sticker.rarity;
					const bRarity = b.sticker.rarity;
					return numberSort(bRarity, aRarity);
				});
				break;
		}
	});

	return { eventStickers, creatorStickers, generalStickers };
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
	sticker: StickerModel,
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
	item: StickerPlacementModel | null,
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

	const { model } = targetController.value;
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
		const payload = await Api.sendRequest('/web/stickers/place', body, { detach: true });
		const { success, resource, parent: payloadParent, stickerPlacement } = payload;
		if (success === false) {
			throw payload;
		}

		addStickerToTarget(targetController.value, new StickerPlacementModel(stickerPlacement));

		model.assign(resource);
		const { parent } = targetController.value;

		if (payloadParent && parent.value) {
			parent.value.model.assign(payloadParent);
		}

		closeStickerDrawer(store);

		// Update our sticker charge after a successful placement.
		if (isCharged) {
			currentCharge.value = Math.max(0, currentCharge.value - chargeCost.value);
		}
	} catch (e) {
		console.error(e);
		closeStickerDrawer(store);
		showErrorGrowl($gettext(`Failed to place sticker.`));
	}

	isChargingSticker.value = false;
}

/**
 * Add or subtract from the drawer item count
 */
export function alterStickerStoreItemCount(
	store: StickerStore,
	sticker: StickerModel,
	returnToDrawer = false
) {
	const drawerItem = store.allStickers.value.find(i => {
		return i.sticker.id === sticker.id;
	});

	// This shouldn't ever trigger
	if (!drawerItem || typeof drawerItem.count !== 'number') {
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
		target.onPlaceDrawerSticker(pointer);
	} else if (sticker.value) {
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
