<script lang="ts">
import { CSSProperties, computed } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackRatio } from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { touchUser } from '../../../../../_common/user/user.model';
import { kBorderRadiusLg, kBorderWidthBase } from '../../../../../_styles/variables';
import AppDashShopItem from '.././AppDashShopItem.vue';
import AppDashShopItemAdd from '../AppDashShopItemAdd.vue';
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
const routeTitle = computed(() => $gettext(`Manage Shop Content`));

const controller = useShopManagerStore()!;
const { avatarFrames, backgrounds, stickerPacks, stickers } = controller;

createAppRoute({
	routeTitle,
});

function getPublishedCount(items: ShopManagerGroupItem[]) {
	return items.reduce((result, i) => (i.has_active_sale ? result + 1 : result), 0);
}

const sectionData = computed<
	{
		typename: ShopManagerGroupItemType;
		label: string;
		data: ShopManagerGroup;
		canAdd?: boolean;
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
			canAdd: frameData.canAdd,
			ratio: 1,
		},
		{
			typename: `Background`,
			label: $gettext(`Backgrounds`),
			data: backgroundData,
			canAdd: backgroundData.canAdd,
			ratio: 1,
		},
		{
			typename: `Sticker_Pack`,
			label: $gettext(`Sticker packs`),
			data: stickerPackData,
			canAdd: stickerPackData.canAdd,
			ratio: StickerPackRatio,
		},
		{
			typename: `Sticker`,
			label: $gettext(`Stickers`),
			data: stickerData,
			canAdd: stickerData.canAdd,
			ratio: 1,
		},
		// {
		// 	typename: `Sticker_Pack`,
		// 	premium: false,
		// 	label: $gettext(`Sticker packs (non-premium)`),
		// 	data: freeStickerPacks.value,
		// 	canAdd: freeStickerPacks.value.canAdd,
		// 	ratio: StickerPackRatio,
		// },
		// {
		// 	typename: `Sticker`,
		// 	premium: false,
		// 	label: $gettext(`Stickers (non-premium)`),
		// 	data: freeStickers.value,
		// 	canAdd: freeStickers.value.canAdd,
		// 	ratio: 1,
		// },
	];
});

const headerStyles: CSSProperties = {
	marginTop: 0,
};

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
		<h1 :style="headerStyles">
			{{ $gettext(`Shop products`) }}
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

		<div v-for="{ label, typename, data, ratio, canAdd } of sectionData" :key="label">
			<h4 :style="subheaderStyles">
				{{ label }}
			</h4>

			<div
				v-if="data.slotAmount || data.maxPublished"
				class="help-block"
				:style="helpBlockStyles"
			>
				<p>
					<template v-if="data.slotAmount">
						{{ data.itemCount ?? data.items.length }}
						{{ ' / ' }}
						{{ data.slotAmount }}
						{{ ' ' }}
						{{ $gettext(`slots used`) }}
					</template>

					<br v-if="data.slotAmount && data.maxPublished" />

					<template v-if="data.maxPublished">
						{{ getPublishedCount(data.items) }}
						{{ ' / ' }}
						{{ data.maxPublished }}
						{{ ' ' }}
						{{ $gettext(`published`) }}
					</template>
				</p>
			</div>

			<div :style="gridStyles">
				<AppDashShopItemAdd
					v-if="canAdd"
					key="add-item"
					:typename="typename"
					:ratio="ratio"
					:border-radius="itemBorderRadius"
					:border-width="itemBorderWidth"
				/>

				<AppDashShopItem
					v-for="item in data.items"
					:key="item.id"
					:item="item"
					:border-radius="itemBorderRadius"
					:border-width="itemBorderWidth"
					:item-states="{
						active: item.has_active_sale,
						inReview: !item.was_approved,
						// rejected: !!item.rejected_change_request,
					}"
				/>
			</div>
		</div>
	</div>
</template>
