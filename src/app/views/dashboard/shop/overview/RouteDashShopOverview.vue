<script lang="ts">
import { computed } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import {
	ShopProductModel,
	ShopProductResource,
} from '../../../../../_common/shop/product/product-model';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackRatio } from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { touchUser } from '../../../../../_common/user/user.model';
import { isInstance } from '../../../../../utils/utils';
import { useShopDashStore } from '../shop.store';
import AppDashShopItem from './_item/AppDashShopItem.vue';
import AppDashShopItemAdd from './_item/AppDashShopItemAdd.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
const { avatarFrames, backgrounds, stickerPacks, stickers } = useShopDashStore()!;

const routeTitle = computed(() => $gettext(`Shop dashboard`));

createAppRoute({
	routeTitle,
});

function getPublishedCount(items: ShopProductModel[]) {
	return items.reduce((result, i) => {
		// Free sticker packs aren't counted towards the published count.
		if (isInstance(i, StickerPackModel) && !i.is_premium) {
			return result;
		}
		if (i.has_active_sale) {
			return result + 1;
		}
		return result;
	}, 0);
}

function getCanManageForProductResource(resource: ShopProductResource) {
	switch (resource) {
		// Can only add premium.
		case ShopProductResource.AvatarFrame:
			return avatarFrames.value.canEditPremium === true;

		// Can only add premium.
		case ShopProductResource.Background:
			return backgrounds.value.canEditPremium === true;

		// Can only add premium.
		case ShopProductResource.StickerPack:
			return stickerPacks.value.canEditPremium === true;

		// Need to check both canAdd fields.
		case ShopProductResource.Sticker:
			return (stickers.value.canEditFree || stickers.value.canEditPremium) === true;
	}
}

function getLimitText(current: number, max: number, type: string) {
	return `${current} / ${max} ${type}`;
}

const sectionData = computed(() => {
	return [
		{
			resource: ShopProductResource.AvatarFrame,
			label: $gettext(`Avatar frames`),
			group: avatarFrames.value,
			ratio: 1,
		},
		{
			resource: ShopProductResource.Background,
			label: $gettext(`Backgrounds`),
			group: backgrounds.value,
			ratio: 1,
		},
		{
			resource: ShopProductResource.StickerPack,
			label: $gettext(`Sticker packs`),
			group: stickerPacks.value,
			ratio: StickerPackRatio,
		},
		{
			resource: ShopProductResource.Sticker,
			label: $gettext(`Stickers`),
			group: stickers.value,
			ratio: 1,
		},
	].map(i => ({
		...i,
		canManage: getCanManageForProductResource(i.resource),
	}));
});
</script>

<template>
	<div>
		<h1 :style="{ marginTop: 0 }">
			{{ routeTitle }}
		</h1>

		<p>
			{{
				$gettext(
					`These are your shop products. You can submit and swap out active items to sell in the Content Shop. Some changes may require an approval process.`
				)
			}}
		</p>

		<AppSpacer vertical :scale="4" />

		<div v-for="{ label, resource, group, ratio, canManage } of sectionData" :key="label">
			<h4
				:style="{
					marginTop: 0,
					marginBottom: 0,
				}"
			>
				{{ label }}
			</h4>

			<div
				v-if="group.slotAmount || group.maxSalesAmount"
				class="help-block"
				:style="{ marginTop: `4px` }"
			>
				<p>
					<template v-if="group.slotAmount">
						{{
							getLimitText(
								group.slotUsedCount,
								group.slotAmount,
								$gettext(`slots used`)
							)
						}}
					</template>

					<br v-if="group.slotAmount && group.maxSalesAmount" />

					<template v-if="group.maxSalesAmount">
						{{
							getLimitText(
								getPublishedCount(group.items),
								group.maxSalesAmount,
								$gettext(`published`)
							)
						}}
					</template>
				</p>
			</div>

			<div
				:style="{
					display: `grid`,
					gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
					gap: `16px`,
					marginBottom: `32px`,
				}"
			>
				<AppDashShopItemAdd
					v-if="canManage"
					key="add-item"
					:resource="resource"
					:ratio="ratio"
				/>

				<AppDashShopItem v-for="item in group.sortedItems" :key="item.id" :item="item" />
			</div>
		</div>
	</div>
</template>
