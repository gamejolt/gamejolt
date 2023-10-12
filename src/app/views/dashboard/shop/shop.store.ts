import { InjectionKey, Ref, computed, inject, provide, ref, shallowReadonly } from 'vue';
import { AvatarFrameModel } from '../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../_common/background/background.model';
import {
	CreatorChangeRequestModel,
	CreatorChangeRequestStatus,
} from '../../../../_common/creator/change-request/creator-change-request.model';
import {
	ShopProductModel,
	ShopProductResource,
	getShopProductResource,
} from '../../../../_common/shop/product/product-model';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import { stringSort } from '../../../../utils/array';
import { assertNever, isInstance } from '../../../../utils/utils';

export interface ShopDashGroup<T extends ShopProductModel = ShopProductModel> {
	resource: ShopProductResource;
	items: T[];
	sortedItems: T[];
	slotUsedCount: number;
	slotAmount?: number;
	maxSalesAmount?: number;
	canEditFree?: boolean;
	canEditPremium?: boolean;
}

export interface ShopDashProductStates {
	/**
	 * Either `published` for publishable items, or `is_active` for free sticker
	 * packs. No visual distinction is made between the two.
	 */
	published?: boolean;
	inReview?: boolean;
	rejected?: boolean;
}

// Simple mapping of the product resources to their "pretty" route params.
const productResourceParams = {
	[ShopProductResource.AvatarFrame]: 'avatar-frame',
	[ShopProductResource.Background]: 'background',
	[ShopProductResource.Sticker]: 'sticker',
	[ShopProductResource.StickerPack]: 'sticker-pack',
} as const satisfies Record<ShopProductResource, string>;

/**
 * The route param that gets used to identify a product resource.
 */
export type ShopDashProductResourceParam =
	(typeof productResourceParams)[keyof typeof productResourceParams];

/**
 * Returns the route param to use for a particular product.
 */
export function getShopDashProductResourceParam(
	resourceOrModel: ShopProductResource | ShopProductModel
) {
	if (typeof resourceOrModel === 'object') {
		resourceOrModel = getShopProductResource(resourceOrModel);
	}

	return productResourceParams[resourceOrModel];
}

/**
 * Returns the product resource from a route param.
 */
export function getShopDashProductResourceFromParam(param: ShopDashProductResourceParam) {
	for (const [resource, checkParam] of Object.entries(productResourceParams)) {
		if (checkParam === param) {
			return resource as ShopProductResource;
		}
	}
}

export const enum ShopDashProductType {
	Basic = 'basic',
	Premium = 'premium',
	Reward = 'reward',
}

export function getShopDashProductType(product: ShopProductModel): ShopDashProductType {
	if (product.is_premium) {
		return ShopDashProductType.Premium;
	} else if (product instanceof StickerPackModel) {
		return ShopDashProductType.Reward;
	} else {
		return ShopDashProductType.Basic;
	}
}

export type ShopDashStore = ReturnType<typeof createShopDashStore>;
const ShopDashStoreKey: InjectionKey<ShopDashStore> = Symbol('ShopDashStore');

export function createShopDashStore() {
	const publishedStickers = ref(new Set<number>());
	const changeRequests = ref(new Map<string, CreatorChangeRequestModel>());

	const avatarFrames = _makeEmptyGroup<AvatarFrameModel>(ShopProductResource.AvatarFrame);
	const backgrounds = _makeEmptyGroup<BackgroundModel>(ShopProductResource.Background);
	const stickerPacks = _makeEmptyGroup<StickerPackModel>(ShopProductResource.StickerPack);
	const stickers = _makeEmptyGroup<StickerModel>(ShopProductResource.Sticker);

	function _makeEmptyGroup<T extends ShopProductModel>(resource: ShopProductResource) {
		const items = ref<T[]>([]);

		const sortedItems = computed(() => {
			return items.value
				.map(item => {
					const itemStates = getShopProductStates(item);

					let sort = 0;
					if (item.is_premium) {
						sort -= 100;
					}
					if (itemStates.published) {
						sort -= 10;
					}
					if (item.was_approved) {
						sort -= 1;
					}

					return {
						sort,
						item,
						name: item.name.toLowerCase(),
					};
				})
				.sort((a, b) => {
					if (a.sort === b.sort) {
						return stringSort(a.name, b.name);
					}
					return a.sort - b.sort;
				})
				.map(i => i.item);
		});

		const slotUsedCount = computed(() => {
			// Need to count differently for certain model types.
			if (items.value.length && items.value[0] instanceof StickerPackModel) {
				return items.value.reduce((acc, item) => (item.is_premium ? acc + 1 : acc), 0);
			}
			return items.value.length;
		});

		return ref({
			resource,
			items,
			sortedItems,
			slotUsedCount,
		}) as Ref<ShopDashGroup<T>>;
	}

	function getGroupForResource(resource: ShopProductResource) {
		switch (resource) {
			case ShopProductResource.AvatarFrame:
				return avatarFrames.value;
			case ShopProductResource.Background:
				return backgrounds.value;
			case ShopProductResource.StickerPack:
				return stickerPacks.value;
			case ShopProductResource.Sticker:
				return stickers.value;
			default:
				return assertNever(resource);
		}
	}

	function getChangeRequest(product: ShopProductModel) {
		const key = _makeChangeRequestKey(product);
		return changeRequests.value.get(key);
	}

	function storeChangeRequest(
		product: ShopProductModel | CreatorChangeRequestModel,
		changeRequest: CreatorChangeRequestModel
	) {
		// TODO(creator-shops): bit of a hack, should be done in backend
		if (changeRequest.status === CreatorChangeRequestStatus.Approved) {
			return;
		}

		const key = _makeChangeRequestKey(product);
		changeRequests.value.set(key, changeRequest);
	}

	function removeChangeRequest(product: ShopProductModel) {
		const key = _makeChangeRequestKey(product);
		changeRequests.value.delete(key);
	}

	function getShopProductStates(
		item: ShopProductModel | CreatorChangeRequestModel
	): ShopDashProductStates {
		const isChangeRequest = isInstance(item, CreatorChangeRequestModel);
		let published: boolean | undefined = undefined;

		if (isInstance(item, StickerPackModel) && !item.is_premium) {
			published = item.is_active;
		} else if (isInstance(item, StickerModel)) {
			published = publishedStickers.value.has(item.id);
		} else if (!isChangeRequest) {
			published = item.has_active_sale;
		}

		const { status } = changeRequests.value.get(_makeChangeRequestKey(item)) || {};

		return {
			published,
			inReview:
				status === CreatorChangeRequestStatus.Submitted ||
				status === CreatorChangeRequestStatus.InReview,
			rejected: status === CreatorChangeRequestStatus.Rejected,
		};
	}

	function isSameValues(val: any, otherVal: any) {
		if (Array.isArray(val) && Array.isArray(otherVal)) {
			if (!val.length && !otherVal.length) {
				return true;
			}
			if (val.length !== otherVal.length) {
				return false;
			}

			// We need to sort the arrays so that we can compare them.
			const sortedVal = _sortUnknownList(val);
			const sortedOtherVal = _sortUnknownList(otherVal);
			return sortedVal.every((i, index) => i === sortedOtherVal[index]);
		}

		return val === otherVal;
	}

	function _makeSortValue(val: any): string {
		if (Object.hasOwn(val, 'id')) {
			return `${val.id}`;
		}
		return `${val}`;
	}

	function _sortUnknownList(list: any[]): string[] {
		return list.map(_makeSortValue).sort(stringSort);
	}

	const c = shallowReadonly({
		avatarFrames,
		backgrounds,
		stickerPacks,
		stickers,
		publishedStickers,

		changeRequests,
		getChangeRequest,
		storeChangeRequest,
		removeChangeRequest,

		/**
		 * Helper to get the total number of items that take up a slot.
		 *
		 * We show all premium and non-premium items in the same list, and some
		 * of those non-premium versions aren't optional and can't be removed,
		 * so we need to count them differently than just adding them all up.
		 */
		getShopProductStates,
		getGroupForResource,

		/**
		 * Returns a boolean indicating equality between two values.
		 */
		isSameValues,
	});

	provide(ShopDashStoreKey, c);
	return c;
}

export function useShopDashStore() {
	return inject(ShopDashStoreKey, null);
}

export function populateShopDashStoreGroup(
	store: ShopDashStore,
	group: ShopDashGroup,
	data: Pick<
		ShopDashGroup,
		'canEditFree' | 'canEditPremium' | 'slotAmount' | 'maxSalesAmount'
	> & {
		changeRequests?: CreatorChangeRequestModel[];
		stickerIds?: Record<number, number[]>;
	},
	items: ShopProductModel[]
) {
	const { canEditFree, canEditPremium, slotAmount, maxSalesAmount, changeRequests, stickerIds } =
		data;

	group.canEditFree = canEditFree;
	group.canEditPremium = canEditPremium;
	group.items = items;
	group.slotAmount = slotAmount;
	group.maxSalesAmount = maxSalesAmount;

	// The below data goes into the store.
	if (changeRequests) {
		for (const request of changeRequests) {
			store.storeChangeRequest(request, request);
		}
	}

	if (stickerIds) {
		for (const ids of Object.values(stickerIds)) {
			for (const id of ids) {
				store.publishedStickers.value.add(id);
			}
		}
	}
}

function _makeChangeRequestKey(model: ShopProductModel | CreatorChangeRequestModel): string;
function _makeChangeRequestKey(resource: ShopProductResource, id: number | string): string;
function _makeChangeRequestKey(
	resourceOrModel: ShopProductModel | CreatorChangeRequestModel | ShopProductResource,
	maybeId?: number | string | never
): string {
	let resource: ShopProductResource;
	let id: number | string;
	if (typeof resourceOrModel === 'string') {
		resource = resourceOrModel;
		id = maybeId!;
	} else if (isInstance(resourceOrModel, CreatorChangeRequestModel)) {
		resource = resourceOrModel.resource;
		id = resourceOrModel.resource_id;
	} else {
		resource = getShopProductResource(resourceOrModel);
		id = resourceOrModel.id;
	}
	return `${resource}:${id}`;
}
