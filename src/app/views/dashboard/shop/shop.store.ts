import { InjectionKey, inject, provide, ref, shallowReadonly } from 'vue';
import { AvatarFrameModel } from '../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../_common/background/background.model';
import { ShopItemModelCommonFields } from '../../../../_common/model/shop-item-model.service';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';

type ItemModel = AvatarFrameModel | BackgroundModel | StickerPackModel | StickerModel;
export type ShopManagerGroupItem = ItemModel & ShopItemModelCommonFields;

export interface ShopManagerGroup<T extends ShopManagerGroupItem = ShopManagerGroupItem> {
	items: T[];
	itemCount?: number;
	slotAmount?: number;
	maxPublished?: number;
	canAdd?: boolean;
}

const itemTypes = ['Avatar_Frame', 'Background', 'Sticker_Pack', 'Sticker'] as const;
export type ShopManagerGroupItemType = (typeof itemTypes)[number];
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

export type ShopManagerStore = ReturnType<typeof createShopManagerStore>;
const shopManagerStoreKey: InjectionKey<ShopManagerStore> = Symbol('shop-manager-store');

export function createShopManagerStore() {
	function _makeEmptyGroup<T extends ShopManagerGroupItem>() {
		return ref<ShopManagerGroup<T>>({
			items: [] as T[],
			itemCount: 0,
			slotAmount: 100,
			maxPublished: 3,
			canAdd: false,
		});
	}

	const avatarFrames = _makeEmptyGroup<AvatarFrameModel>();
	const backgrounds = _makeEmptyGroup<BackgroundModel>();
	const stickerPacks = _makeEmptyGroup<StickerPackModel>();
	const stickers = _makeEmptyGroup<StickerModel>();

	const c = shallowReadonly({
		avatarFrames,
		backgrounds,
		stickerPacks,
		stickers,
	});

	provide(shopManagerStoreKey, c);
	return c;
}

export function useShopManagerStore() {
	return inject(shopManagerStoreKey, null);
}
