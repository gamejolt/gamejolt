<script lang="ts">
import { InjectionKey, Ref, computed, inject, provide, ref, shallowReadonly } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { AvatarFrameModel } from '../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../_common/background/background.model';
import { ShopItemModelCommonFields } from '../../../../_common/model/shop-item-model.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../_common/translate/translate.service';
import { arrayAssignAll } from '../../../../utils/array';
import { RouteLocationRedirect } from '../../../../utils/router';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import RouteLandingCreators from '../../landing/creators/RouteLandingCreators.vue';

type ItemModel = AvatarFrameModel | BackgroundModel | StickerPackModel | StickerModel;
export type ShopManagerGroupItem = ItemModel & ShopItemModelCommonFields;

export interface ShopManagerGroup<T extends ShopManagerGroupItem = ShopManagerGroupItem> {
	items: T[];
	itemCount?: number;
	// activeCount?: number;
	// activeIds: number[];
	slotAmount?: number;
	maxPublished?: number;
	canAdd?: boolean;
}

const itemTypes = ['Avatar_Frame', 'Background', 'Sticker_Pack', 'Sticker'] as const;
export type ShopManagerGroupItemType = (typeof itemTypes)[number];

const shopManagerStoreKey: InjectionKey<ShopManagerStore> = Symbol('shop-manager-store');

export type ShopManagerStore = ReturnType<typeof createShopManagerStore>;

function createShopManagerStore() {
	function _makeEmptyGroup<T extends ShopManagerGroupItem>() {
		return ref<ShopManagerGroup<T>>({
			// activeIds: [] as number[],
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

	function castTypename(typename: string) {
		if (itemTypes.includes(typename as any)) {
			return typename as ShopManagerGroupItemType;
		}
		return null;
	}

	function findItemGroup<T extends ShopManagerGroupItem>(
		item: T | string
	): Ref<ShopManagerGroup<T>> | undefined {
		const typename = typeof item === 'string' ? castTypename(item) : null;

		if (item instanceof AvatarFrameModel || typename === 'Avatar_Frame') {
			return avatarFrames as Ref<ShopManagerGroup<T>>;
		} else if (item instanceof BackgroundModel || typename === 'Background') {
			return backgrounds as Ref<ShopManagerGroup<T>>;
		} else if (item instanceof StickerPackModel || typename === 'Sticker_Pack') {
			return stickerPacks as Ref<ShopManagerGroup<T>>;
		} else if (item instanceof StickerModel || typename === 'Sticker') {
			return stickers as Ref<ShopManagerGroup<T>>;
		}
	}

	function addItem<T extends ShopManagerGroupItem>(item: T, { insert } = { insert: false }) {
		const group = findItemGroup<T>(item);
		if (!group) {
			return;
		}

		removeItem(item);
		if (insert) {
			group.value.items.unshift(item);
		} else {
			group.value.items.push(item);
		}
	}

	function removeItem<T extends ShopManagerGroupItem>(toRemove: T) {
		const group = findItemGroup(toRemove);
		if (!group) {
			return;
		}
		const newItems = group.value.items.reduce<T[]>((result, item) => {
			if (item.id !== toRemove.id) {
				result.push(item);
			}
			return result;
		}, []);
		arrayAssignAll(group.value.items, newItems);
	}

	function _makeEmptyChanges() {
		return {
			items: [] as ShopManagerGroupItem[],
			count: 0,
		};
	}

	const changes = {
		approved: ref(_makeEmptyChanges()),
		inReview: ref(_makeEmptyChanges()),
		rejected: ref(_makeEmptyChanges()),
		draft: ref({ ids: new Set<number>() }),
	};

	const c = shallowReadonly({
		//
		avatarFrames,
		backgrounds,
		stickerPacks,
		stickers,

		//
		canLoadFrames: ref(true),
		canLoadBackgrounds: ref(true),
		canLoadStickerPacks: ref(true),
		canLoadStickers: ref(true),

		//
		addItem,
		removeItem,
		findItemGroup,

		castTypename,

		//
		changes,
	});

	provide(shopManagerStoreKey, c);
	return c;
}

export function useShopManagerStore() {
	return inject(shopManagerStoreKey, null);
}

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: async () => {
			try {
				return Api.sendFieldsRequest(
					`/mobile/me`,
					{ creatorExperience: true },
					{ noErrorRedirect: true }
				);
			} catch (error) {
				// Redirect away if the request fails.
				return new RouteLocationRedirect({
					name: RouteLandingCreators.name,
				});
			}
		},
	}),
};
</script>

<script lang="ts" setup>
createShopManagerStore();

const routeTitle = computed(() => $gettext(`Manage Shop Content`));

createAppRoute({
	routeTitle,
	async onResolved(data) {
		console.warn('RouteDashShop onResolved', data);
	},
});
</script>

<template>
	<AppShellPageBackdrop>
		<section class="section">
			<div class="container">
				{{ 'RouteDashShop' }}

				<RouterView />
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
