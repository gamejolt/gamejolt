<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAnimChargeOrb from '../../../../../../_common/animation/AppAnimChargeOrb.vue';
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
	kThemeFg,
	kThemeFg10,
	kThemeGjDarkGreen,
	kThemeGjGreen,
	kThemeGjOverlayNotice,
} from '../../../../../../_common/theme/variables';
import AppUserAvatarBubble from '../../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import {
	styleBorderRadiusLg,
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

const premiumTagStyles = computed<CSSProperties>(() => ({
	...styleBorderRadiusLg,
	position: `absolute`,
	top: `-12px`,
	right: `-12px`,
	zIndex: 1,
	pointerEvents: `none`,
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

const baseInfoTagStyles: CSSProperties = {
	...styleBorderRadiusLg,
	...styleFlexCenter({
		display: `inline-flex`,
	}),
	gap: `6px`,
	padding: `2px 8px`,
	fontSize: kFontSizeTiny.px,
	fontWeight: `bold`,
	marginTop: `4px`,
};

function getInfoTagStyles(type: 'charge' | 'inReview' | 'rejected') {
	let color = '';
	let backgroundColor = '';

	if (type === 'charge') {
		backgroundColor = kThemeGjDarkGreen;
		color = kThemeGjGreen;
	} else if (type === 'inReview') {
		backgroundColor = kThemeFg10;
		color = kThemeFg;
	} else if (type === 'rejected') {
		backgroundColor = kThemeGjOverlayNotice;
		color = `white`;
	}

	return {
		...baseInfoTagStyles,
		color,
		backgroundColor,
	};
}
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

		<!-- Premium tag -->
		<div v-if="item.is_premium" :style="premiumTagStyles">
			{{ $gettext(`Premium`) }}
		</div>

		<!-- Name -->
		<div v-if="item.name" :style="nameStyles">
			{{ item.name }}
		</div>

		<!-- Product state tags -->
		<div
			:style="
				styleFlexCenter({
					direction: `column`,
				})
			"
		>
			<div
				v-if="
					(isInstance(item, StickerPackModel) || isInstance(item, StickerModel)) &&
					!item.is_premium
				"
				:style="getInfoTagStyles('charge')"
			>
				<AppAnimChargeOrb
					:style="{
						width: baseInfoTagStyles.fontSize,
						height: baseInfoTagStyles.fontSize,
					}"
				/>
				{{ $gettext(`Charge`) }}
			</div>
			<div v-if="itemStates.inReview" :style="getInfoTagStyles('inReview')">
				<AppJolticon :style="{ margin: 0, fontSize: `inherit` }" icon="clock" />
				{{ $gettext(`In review`) }}
			</div>
			<div v-if="itemStates.rejected" :style="getInfoTagStyles('rejected')">
				<AppJolticon
					:style="{ margin: 0, fontSize: `inherit` }"
					icon="exclamation-circle"
				/>
				{{ $gettext(`Rejected`) }}
			</div>
		</div>
	</div>
</template>
