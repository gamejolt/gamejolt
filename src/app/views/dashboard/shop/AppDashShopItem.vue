<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppStickerLayerDrawerItem from '../../../../_common/sticker/layer/AppStickerLayerDrawerItem.vue';
import AppStickerPack from '../../../../_common/sticker/pack/AppStickerPack.vue';
import {
	kThemeBgSubtle,
	kThemeFg,
	kThemeGjOverlayNotice,
	kThemePrimary,
	kThemePrimaryFg,
} from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleElevate, styleFlexCenter } from '../../../../_styles/mixins';
import { kFontSizeSmall } from '../../../../_styles/variables';
import AppDashShopHover from './AppDashShopHover.vue';
import AppDashShopItemBase, { ShopItemStates } from './AppDashShopItemBase.vue';
import {
	ShopManagerGroupItem,
	ShopManagerGroupItemType,
	checkShopItemType,
} from './RouteDashShop.vue';
import { routeDashShopProduct } from './product/product.route';

const props = defineProps({
	item: {
		type: Object as PropType<ShopManagerGroupItem>,
		required: true,
	},
	borderRadius: {
		type: Number,
		default: undefined,
	},
	borderWidth: {
		type: Number,
		default: undefined,
	},
	itemStates: {
		type: Object as PropType<ShopItemStates>,
		default: () => ({} as ShopItemStates),
	},
});

const { item, borderRadius, itemStates } = toRefs(props);

const typename = computed<ShopManagerGroupItemType>(() => {
	const i = item.value;
	if (checkShopItemType(i, 'Avatar_Frame')) {
		return 'Avatar_Frame';
	} else if (checkShopItemType(i, 'Background')) {
		return 'Background';
	} else if (checkShopItemType(i, 'Sticker_Pack')) {
		return 'Sticker_Pack';
	} else if (checkShopItemType(i, 'Sticker')) {
		return 'Sticker';
	}
	throw Error(`Unknown item type`);
});

const shouldShowStateTag = computed(() => Object.values(itemStates.value).some(Boolean));

function makeStateBubbleStyles(backgroundColor: string = kThemePrimary) {
	return {
		...styleFlexCenter(),
		...styleElevate(1),
		borderRadius: `50%`,
		backgroundColor,
		padding: `4px`,
	};
}

function makeStateBubbleIconStyles(color: string = kThemePrimaryFg) {
	return {
		margin: 0,
		fontSize: kFontSizeSmall.px,
		color,
	};
}

// TODO(creator-shops) remove
const showDebugData = false;
</script>

<template>
	<AppDashShopHover
		v-if="!!typename"
		:border-radius="borderRadius"
		:border-width="borderWidth"
		:style="{
			width: `100%`,
		}"
		:to="{
			name: routeDashShopProduct.name,
			params: {
				typename,
				id: item.id,
			},
		}"
	>
		<template #default="{ borderRadius: parentRadius }">
			<AppDashShopItemBase :name="item.name">
				<template #img>
					<AppUserAvatarBubble
						v-if="checkShopItemType(item, 'Avatar_Frame')"
						:user="null"
						:frame-override="item"
						smoosh
						show-frame
					/>
					<AppBackground
						v-if="checkShopItemType(item, 'Background')"
						:background="item"
						:style="{
							borderRadius: `${parentRadius}px`,
							overflow: `hidden`,
						}"
						:background-style="{
							backgroundSize: `cover`,
							backgroundPosition: `center`,
						}"
					>
						<AppAspectRatio :ratio="1" />
					</AppBackground>
					<AppStickerPack
						v-if="checkShopItemType(item, 'Sticker_Pack')"
						:pack="item"
						:border-radius="parentRadius"
					/>
					<AppStickerLayerDrawerItem
						v-if="checkShopItemType(item, 'Sticker')"
						:sticker="item"
						no-drag
						hide-count
						fit-parent
					/>
				</template>

				<div
					v-if="shouldShowStateTag"
					:style="{
						position: `absolute`,
						top: `-6px`,
						left: `-6px`,
						right: `-6px`,
						zIndex: 1,
						display: `inline-flex`,
						flexWrap: `wrap`,
						gap: `2px 4px`,
					}"
				>
					<div
						v-if="itemStates.active || showDebugData"
						v-app-tooltip="$gettext(`Available in the shop`)"
						:style="makeStateBubbleStyles()"
					>
						<AppJolticon icon="check" :style="makeStateBubbleIconStyles()" />
					</div>
					<div
						v-if="itemStates.draft || showDebugData"
						v-app-tooltip="$gettext(`Un-submitted changes`)"
						:style="makeStateBubbleStyles(kThemeBgSubtle)"
					>
						<AppJolticon icon="edit" :style="makeStateBubbleIconStyles(kThemeFg)" />
					</div>
					<div
						v-if="itemStates.inReview || showDebugData"
						v-app-tooltip="$gettext(`In review`)"
						:style="makeStateBubbleStyles()"
					>
						<AppJolticon icon="clock" :style="makeStateBubbleIconStyles()" />
					</div>
					<div
						v-if="itemStates.rejected || showDebugData"
						v-app-tooltip="$gettext(`Rejected`)"
						:style="makeStateBubbleStyles(kThemeGjOverlayNotice)"
					>
						<AppJolticon
							icon="exclamation"
							:style="makeStateBubbleIconStyles(`white`)"
						/>
					</div>
				</div>
			</AppDashShopItemBase>
		</template>
	</AppDashShopHover>
</template>
