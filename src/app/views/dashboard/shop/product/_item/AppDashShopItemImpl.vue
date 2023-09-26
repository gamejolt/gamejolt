<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import AppBackground from '../../../../../../_common/background/AppBackground.vue';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import AppStickerLayerDrawerItem from '../../../../../../_common/sticker/layer/AppStickerLayerDrawerItem.vue';
import AppStickerPack from '../../../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import {
	kThemeGjOverlayNotice,
	kThemePrimary,
	kThemePrimaryFg,
} from '../../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarBubble from '../../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import {
	styleAbsoluteFill,
	styleBorderRadiusLg,
	styleElevate,
	styleFlexCenter,
	styleLineClamp,
	styleWhen,
} from '../../../../../../_styles/mixins';
import { kFontSizeSmall, kFontSizeTiny } from '../../../../../../_styles/variables';
import { isInstance } from '../../../../../../utils/utils';
import { ShopManagerGroupItem } from '../../shop.store';
import { ShopItemStates } from './AppDashShopItem.vue';

const props = defineProps({
	item: {
		type: Object as PropType<ShopManagerGroupItem>,
		required: true,
	},
	borderRadius: {
		type: Number,
		required: true,
	},
	hovered: {
		type: Boolean,
		required: true,
	},
	itemStates: {
		type: Object as PropType<ShopItemStates>,
		required: true,
	},
});

const { borderRadius, hovered } = toRefs(props);

const backgroundStyles: CSSProperties = {
	borderRadius: `${borderRadius.value}px`,
	overflow: `hidden`,
};

const nameStyles: CSSProperties = {
	...styleLineClamp(2),
	marginTop: `4px`,
	fontWeight: `bold`,
	fontSize: kFontSizeTiny.px,
	textAlign: `center`,
};

const tagsContainerStyles: CSSProperties = {
	...styleAbsoluteFill({
		zIndex: 1,
		inset: `-12px`,
		// Don't overlap the name below the image.
		bottom: 0,
	}),
	display: `flex`,
	justifyContent: `space-between`,
	gap: `8px`,
};

const statesContainerStyles: CSSProperties = {
	display: `flex`,
	flexDirection: `column`,
	flexWrap: `wrap`,
	gap: `4px`,
	opacity: 0.8,
};

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

const premiumTagStyles = computed<CSSProperties>(() => ({
	...styleBorderRadiusLg,
	backgroundColor: `#FFBE00`,
	color: `black`,
	fontWeight: `bold`,
	fontSize: kFontSizeSmall.px,
	padding: `2px 6px`,
	transition: `opacity 250ms`,
	...styleWhen(hovered.value, {
		opacity: 0,
	}),
}));
</script>

<template>
	<div :style="{ width: `100%`, position: `relative` }">
		<!-- Image -->
		<AppUserAvatarBubble
			v-if="isInstance(item, AvatarFrameModel)"
			:user="null"
			:frame-override="item"
			smoosh
			show-frame
		/>
		<AppBackground
			v-else-if="isInstance(item, BackgroundModel)"
			:background="item"
			:style="backgroundStyles"
			:background-style="{
				backgroundSize: `cover`,
				backgroundPosition: `center`,
			}"
		>
			<AppAspectRatio :ratio="1" />
		</AppBackground>
		<AppStickerPack
			v-else-if="isInstance(item, StickerPackModel)"
			:pack="item"
			:border-radius="borderRadius"
		/>
		<AppStickerLayerDrawerItem
			v-else-if="isInstance(item, StickerModel)"
			:sticker="item"
			no-drag
			hide-count
			fit-parent
		/>

		<!-- Tags -->
		<div :style="tagsContainerStyles">
			<!-- Item states -->
			<div :style="statesContainerStyles">
				<div
					v-if="itemStates.active"
					v-app-tooltip="$gettext(`Available in the shop`)"
					:style="makeStateBubbleStyles()"
				>
					<AppJolticon icon="marketplace" :style="makeStateBubbleIconStyles()" />
				</div>
				<div
					v-if="itemStates.inReview"
					v-app-tooltip="$gettext(`In review`)"
					:style="makeStateBubbleStyles()"
				>
					<AppJolticon icon="clock" :style="makeStateBubbleIconStyles()" />
				</div>
				<div
					v-if="itemStates.rejected"
					v-app-tooltip="$gettext(`Rejected`)"
					:style="makeStateBubbleStyles(kThemeGjOverlayNotice)"
				>
					<AppJolticon icon="exclamation" :style="makeStateBubbleIconStyles(`white`)" />
				</div>
			</div>

			<!-- Premium -->
			<div :style="{ justifySelf: `flex-end`, pointerEvents: `none` }">
				<div v-if="item.is_premium" :style="premiumTagStyles">
					{{ $gettext(`Premium`) }}
				</div>
			</div>
		</div>

		<!-- Name -->
		<div v-if="item.name" :style="nameStyles">
			{{ item.name }}
		</div>
	</div>
</template>
