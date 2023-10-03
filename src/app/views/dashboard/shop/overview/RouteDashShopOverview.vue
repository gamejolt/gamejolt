<script lang="ts">
import { CSSProperties, computed } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackRatio } from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { touchUser } from '../../../../../_common/user/user.model';
import { kBorderRadiusLg, kBorderWidthBase } from '../../../../../_styles/variables';
import { isInstance } from '../../../../../utils/utils';
import AppDashShopItem from '../product/_item/AppDashShopItem.vue';
import AppDashShopItemAdd from '../product/_item/AppDashShopItemAdd.vue';
import {
	ShopManagerGroup,
	ShopManagerGroupItem,
	ShopManagerGroupItemType,
	useShopManagerStore,
} from '../shop.store';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
const routeTitle = computed(() => $gettext(`Shop dashboard`));

const {
	avatarFrames,
	backgrounds,
	stickerPacks,
	stickers,
	getItemCountForSlots,
	getShopItemStates,
} = useShopManagerStore()!;

createAppRoute({
	routeTitle,
});

function getPublishedCount(items: ShopManagerGroupItem[]) {
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

function getCanAddForProductType(type: ShopManagerGroupItemType) {
	switch (type) {
		// Can only add premium.
		case 'Avatar_Frame':
			return avatarFrames.value.canEditPremium === true;
		// Can only add premium.
		case 'Background':
			return avatarFrames.value.canEditPremium === true;
		// Can only add premium.
		case 'Sticker_Pack':
			return stickerPacks.value.canEditPremium === true;
		// Need to check both canAdd fields.
		case 'Sticker':
			return (stickers.value.canEditFree || stickers.value.canEditPremium) === true;
	}
}

const sectionData = computed<
	{
		typename: ShopManagerGroupItemType;
		label: string;
		data: ShopManagerGroup;
		ratio: number;
	}[]
>(() => {
	const frameData = avatarFrames.value;
	const backgroundData = backgrounds.value;
	const stickerPackData = stickerPacks.value;
	const stickerData = stickers.value;

	return [
		{
			typename: `Avatar_Frame`,
			label: $gettext(`Avatar frames`),
			data: frameData,
			ratio: 1,
		},
		{
			typename: `Background`,
			label: $gettext(`Backgrounds`),
			data: backgroundData,
			ratio: 1,
		},
		{
			typename: `Sticker_Pack`,
			label: $gettext(`Sticker packs`),
			data: stickerPackData,
			ratio: StickerPackRatio,
		},
		{
			typename: `Sticker`,
			label: $gettext(`Stickers`),
			data: stickerData,
			ratio: 1,
		},
	];
});

const subheaderStyles: CSSProperties = {
	marginTop: 0,
	marginBottom: 0,
};

const helpBlockStyles: CSSProperties = {
	marginTop: `4px`,
};

const gridStyles: CSSProperties = {
	display: `grid`,
	gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
	gap: `16px`,
	marginBottom: `32px`,
};

const itemBorderWidth = kBorderWidthBase.value;
const itemBorderRadius = kBorderRadiusLg.value;
</script>

<template>
	<div>
		<h1 :style="{ marginTop: 0 }">
			{{ routeTitle }}
		</h1>

		<div class="help-block" :style="helpBlockStyles">
			<p>
				{{
					$gettext(
						`These are your shop products. You can submit and swap out active items to sell in the Content Shop. Some changes may require an approval process.`
					)
				}}
			</p>
		</div>

		<AppSpacer vertical :scale="4" />

		<div v-for="{ label, typename, data, ratio } of sectionData" :key="label">
			<h4 :style="subheaderStyles">
				{{ label }}
			</h4>

			<div
				v-if="data.slotAmount || data.maxSalesAmount"
				class="help-block"
				:style="helpBlockStyles"
			>
				<p>
					<template v-if="data.slotAmount">
						{{ getItemCountForSlots(data) }}
						{{ ' / ' }}
						{{ data.slotAmount }}
						{{ ' ' }}
						{{ $gettext(`slots used`) }}
					</template>

					<br v-if="data.slotAmount && data.maxSalesAmount" />

					<template v-if="data.maxSalesAmount">
						{{ getPublishedCount(data.items) }}
						{{ ' / ' }}
						{{ data.maxSalesAmount }}
						{{ ' ' }}
						{{ $gettext(`published`) }}
					</template>
				</p>
			</div>

			<div :style="gridStyles">
				<AppDashShopItemAdd
					v-if="getCanAddForProductType(typename)"
					key="add-item"
					:typename="typename"
					:ratio="ratio"
					:border-radius="itemBorderRadius"
					:border-width="itemBorderWidth"
				/>

				<AppDashShopItem
					v-for="item in data.sortedItems"
					:key="item.id"
					:item="item"
					:border-radius="itemBorderRadius"
					:border-width="itemBorderWidth"
					:item-states="getShopItemStates(item)"
					:can-edit="(item.is_premium ? data.canEditPremium : data.canEditFree) === true"
				/>
			</div>
		</div>
	</div>
</template>
