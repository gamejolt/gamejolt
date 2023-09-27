import { InjectionKey, inject, provide, ref, shallowReadonly } from 'vue';
import { AvatarFrameModel } from '../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../_common/background/background.model';
import { ShopItemModelCommonFields } from '../../../../_common/model/shop-item-model.service';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import { stringSort } from '../../../../utils/array';
import { assertNever } from '../../../../utils/utils';

type ItemModel = AvatarFrameModel | BackgroundModel | StickerPackModel | StickerModel;
export type ShopManagerGroupItem = ItemModel & ShopItemModelCommonFields;

export interface ShopManagerGroup<T extends ShopManagerGroupItem = ShopManagerGroupItem> {
	items: T[];
	slotAmount?: number;
	publishAmount?: number;
	canAddFree?: boolean;
	canAddPremium?: boolean;
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

export function productTypeFromTypename(typename: ShopManagerGroupItemType) {
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
	function _makeEmptyGroup<T extends ShopManagerGroupItem>() {
		return ref<ShopManagerGroup<T>>({
			items: [] as T[],
		});
	}

	const avatarFrames = _makeEmptyGroup<AvatarFrameModel>();
	const backgrounds = _makeEmptyGroup<BackgroundModel>();
	const stickerPacks = _makeEmptyGroup<StickerPackModel>();
	const stickers = _makeEmptyGroup<StickerModel>();

	function getItemCountForSlots<T extends ShopManagerGroupItem>(group: ShopManagerGroup<T>) {
		// Need to count differently for certain model types.
		if (group.items.length && group.items[0] instanceof StickerPackModel) {
			return group.items.reduce((acc, item) => (item.is_premium ? acc + 1 : acc), 0);
		}
		return group.items.length;
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

	const c = shallowReadonly({
		avatarFrames,
		backgrounds,
		stickerPacks,
		stickers,
		/**
		 * Helper to get the total number of items that take up a slot.
		 *
		 * We show all premium and non-premium items in the same list, and some
		 * of those non-premium versions aren't optional and can't be removed,
		 * so we need to count them differently than just adding them all up.
		 */
		getItemCountForSlots,

		/**
		 * Returns a boolean indicating equality between two values.
		 */
		isSameValues(val: any, otherVal: any) {
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
		},
	});

	provide(shopManagerStoreKey, c);
	return c;
}

export function useShopManagerStore() {
	return inject(shopManagerStoreKey, null);
}
