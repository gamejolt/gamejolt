<script lang="ts">
import { computed } from 'vue';
import AppLinkHelp from '../../../../../_common/link/AppLinkHelp.vue';
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
		reloadOn: 'never',
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

function getCanAddForProductResource(resource: ShopProductResource) {
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

		// Need to check both fields.
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
		canAdd: getCanAddForProductResource(i.resource),
	}));
});

/** If any of the groups allow management of premium items */
const canManagePremium = computed(() =>
	sectionData.value.some(({ group }) => group.canEditPremium)
);
</script>

<template>
	<div>
		<h1 :style="{ marginTop: 0 }">
			{{ routeTitle }}
		</h1>

		<template v-if="canManagePremium">
			<div>
				{{
					$gettext(
						`The Game Jolt Shop enables you to design and sell your own sticker packs, backgrounds, and avatar frames, allowing your fans to show their support.`
					)
				}}

				<AppSpacer vertical :scale="2" />

				{{
					$gettext(
						`After uploading your creations, they will go through a review process. Our team will either approve them or email you for necessary modifications.`
					)
				}}
				<AppLinkHelp page="shop">
					{{ $gettext(`Learn more`) }}
				</AppLinkHelp>
			</div>

			<AppSpacer vertical :scale="4" />
		</template>

		<div
			v-for="{ label, resource, group, ratio, canAdd } of sectionData"
			:key="label"
			:style="{
				margin: `32px 0`,
			}"
		>
			<template v-if="canAdd || group.items.length > 0">
				<h4 class="sans-margin">
					{{ label }}
				</h4>

				<!-- Slots -->
				<div
					v-if="group.slotAmount || group.maxSalesAmount"
					class="help-block"
					:style="{ marginTop: `4px`, marginBottom: 0 }"
				>
					<div>
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
					</div>
				</div>

				<AppSpacer vertical :scale="4" />

				<div
					:style="{
						display: `grid`,
						gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
						gap: `16px`,
					}"
				>
					<AppDashShopItemAdd
						v-if="canAdd"
						key="add-item"
						:resource="resource"
						:ratio="ratio"
					/>

					<AppDashShopItem
						v-for="item in group.sortedItems"
						:key="item.id"
						:item="item"
					/>
				</div>
			</template>
		</div>
	</div>
</template>
