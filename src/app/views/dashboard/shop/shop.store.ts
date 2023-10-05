import { InjectionKey, Ref, computed, inject, provide, ref, shallowReadonly } from 'vue';
import { AvatarFrameModel } from '../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../_common/background/background.model';
import {
	CreatorChangeRequestModel,
	CreatorChangeRequestStatus,
} from '../../../../_common/creator/change-request/creator-change-request.model';
import { ShopItemModelCommonFields } from '../../../../_common/model/shop-item-model.service';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import { stringSort } from '../../../../utils/array';
import { assertNever, isInstance } from '../../../../utils/utils';
import { ShopItemStates } from './overview/_item/AppDashShopItem.vue';

export const ShopProductPremiumColor = '#ffbe00';

type ItemModel = AvatarFrameModel | BackgroundModel | StickerPackModel | StickerModel;
export type ShopManagerGroupItem = ItemModel & ShopItemModelCommonFields;

export interface ShopManagerGroup<T extends ShopManagerGroupItem = ShopManagerGroupItem> {
	productType: ProductType;
	items: T[];
	sortedItems: T[];
	slotAmount?: number;
	maxSalesAmount?: number;
	canEditFree?: boolean;
	canEditPremium?: boolean;
}

export interface ShopItemStates {
	/**
	 * Either `published` for publishable items, or `is_active` for free sticker
	 * packs. No visual distinction is made between the two.
	 */
	published?: boolean;
	inReview?: boolean;
	rejected?: boolean;
	/** Whether or not this item is their charge pack. */
	isChargePack: boolean;
}

const typenames = ['Avatar_Frame', 'Background', 'Sticker_Pack', 'Sticker'] as const;
export type ShopManagerGroupItemType = (typeof typenames)[number];
export type ProductType = 'avatar-frame' | 'background' | 'sticker' | 'sticker-pack';
export const productTypes: { [key in ProductType]: ShopManagerGroupItemType } = {
	'avatar-frame': 'Avatar_Frame',
	background: 'Background',
	sticker: 'Sticker',
	'sticker-pack': 'Sticker_Pack',
};

export function productTypeFromTypename(typename: ShopManagerGroupItemType): ProductType;
export function productTypeFromTypename(typename: string): ProductType;
export function productTypeFromTypename(typename: ShopManagerGroupItemType | string) {
	return Object.entries(productTypes).find(([, val]) => val === typename)?.[0];
}

export function getShopProductType(product: ItemModel): ProductType {
	if (product instanceof AvatarFrameModel) {
		return 'avatar-frame';
	} else if (product instanceof BackgroundModel) {
		return 'background';
	} else if (product instanceof StickerPackModel) {
		return 'sticker-pack';
	} else if (product instanceof StickerModel) {
		return 'sticker';
	} else {
		return assertNever(product);
	}
}

export type ShopManagerStore = ReturnType<typeof createShopManagerStore>;
const shopManagerStoreKey: InjectionKey<ShopManagerStore> = Symbol('shop-manager-store');

export function createShopManagerStore() {
	function _makeEmptyGroup<T extends ShopManagerGroupItem>(productType: ProductType) {
		const items = ref<T[]>([]);
		const sortedItems = computed(() => {
			return items.value
				.map(item => {
					const itemStates = getShopItemStates(item);

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

		return ref({
			productType,
			items,
			sortedItems,
		}) as Ref<ShopManagerGroup<T>>;
	}

	const avatarFrames = _makeEmptyGroup<AvatarFrameModel>('avatar-frame');
	const backgrounds = _makeEmptyGroup<BackgroundModel>('background');
	const stickerPacks = _makeEmptyGroup<StickerPackModel>('sticker-pack');
	const stickers = _makeEmptyGroup<StickerModel>('sticker');

	const changeRequests = ref(new Map<string, CreatorChangeRequestModel>());
	const publishedStickers = ref(new Set<number>());

	function getItemCountForSlots<T extends ShopManagerGroupItem>(group: ShopManagerGroup<T>) {
		// Need to count differently for certain model types.
		if (group.sortedItems.length && group.sortedItems[0] instanceof StickerPackModel) {
			return group.sortedItems.reduce((acc, item) => (item.is_premium ? acc + 1 : acc), 0);
		}
		return group.sortedItems.length;
	}

	function getChangeRequestKey(item: ShopManagerGroupItem | CreatorChangeRequestModel): string;
	function getChangeRequestKey(type: ProductType, id: number | string): string;
	function getChangeRequestKey(
		itemOrType: ShopManagerGroupItem | CreatorChangeRequestModel | ProductType,
		maybeId?: number | string | never
	): string {
		let type: ProductType;
		let id: number | string;
		if (typeof itemOrType === 'string') {
			type = itemOrType;
			id = maybeId!;
		} else if (isInstance(itemOrType, CreatorChangeRequestModel)) {
			type = productTypeFromTypename(itemOrType.resource);
			id = itemOrType.resource_id;
		} else {
			type = getShopProductType(itemOrType);
			id = itemOrType.id;
		}
		return `${type}:${id}`;
	}

	function grabSortValue(val: any): string {
		if (Object.hasOwn(val, 'id')) {
			return `${val.id}`;
		}
		return `${val}`;
	}

	function sortUnknownList(list: any[]): string[] {
		return list.map(grabSortValue).sort(stringSort);
	}

	function getShopItemStates(
		item: ShopManagerGroupItem | CreatorChangeRequestModel
	): ShopItemStates {
		const isChangeRequest = isInstance(item, CreatorChangeRequestModel);
		let published: boolean | undefined = undefined;
		let isChargePack = false;

		if (isInstance(item, StickerPackModel) && !item.is_premium) {
			published = item.is_active;
			isChargePack = true;
		} else if (isInstance(item, StickerModel)) {
			published = publishedStickers.value.has(item.id);
		} else if (!isChangeRequest) {
			published = item.has_active_sale;
		}

		const { status } = changeRequests.value.get(getChangeRequestKey(item)) || {};

		return {
			published,
			inReview:
				status === CreatorChangeRequestStatus.Submitted ||
				status === CreatorChangeRequestStatus.InReview,
			rejected: status === CreatorChangeRequestStatus.Rejected,

			isChargePack,
		};
	}

	function getGroupForType(type: ShopManagerGroupItemType) {
		switch (type) {
			case 'Avatar_Frame':
				return avatarFrames.value;
			case 'Background':
				return backgrounds.value;
			case 'Sticker_Pack':
				return stickerPacks.value;
			case 'Sticker':
				return stickers.value;
			default:
				return assertNever(type);
		}
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
			const sortedVal = sortUnknownList(val);
			const sortedFormVal = sortUnknownList(otherVal);
			return sortedVal.every((i, index) => i === sortedFormVal[index]);
		}

		return val === otherVal;
	}

	const c = shallowReadonly({
		avatarFrames,
		backgrounds,
		stickerPacks,
		stickers,

		changeRequests,
		getChangeRequestKey,
		publishedStickers,

		/**
		 * Helper to get the total number of items that take up a slot.
		 *
		 * We show all premium and non-premium items in the same list, and some
		 * of those non-premium versions aren't optional and can't be removed,
		 * so we need to count them differently than just adding them all up.
		 */
		getItemCountForSlots,
		getShopItemStates,
		getGroupForType,

		/**
		 * Returns a boolean indicating equality between two values.
		 */
		isSameValues,
	});

	provide(shopManagerStoreKey, c);
	return c;
}

export function useShopManagerStore() {
	return inject(shopManagerStoreKey, null);
}
