<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import AppDashShopProductType from '~app/views/dashboard/shop/AppDashShopProductType.vue';
import { getShopDashProductType, ShopDashProductStates } from '~app/views/dashboard/shop/shop.store';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { AvatarFrameModel } from '~common/avatar/frame.model';
import AppBackground from '~common/background/AppBackground.vue';
import { BackgroundModel } from '~common/background/background.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { ShopProductModel } from '~common/shop/product/product-model';
import AppStickerLayerDrawerItem from '~common/sticker/layer/AppStickerLayerDrawerItem.vue';
import AppStickerPack from '~common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { StickerModel } from '~common/sticker/sticker.model';
import {
	kThemeBiBg,
	kThemeBiFg,
	kThemeFg,
	kThemeFg10,
	kThemeGjOverlayNotice,
} from '~common/theme/variables';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import {
	styleBorderRadiusLg,
	styleFlexCenter,
	styleLineClamp,
	styleWhen,
} from '~styles/mixins';
import { kFontSizeTiny } from '~styles/variables';
import { isInstance } from '~utils/utils';

type Props = {
	item: ShopProductModel;
	borderRadius: number;
	hovered: boolean;
	itemStates: ShopDashProductStates;
};
const { item, borderRadius, hovered, itemStates } = defineProps<Props>();

const productType = computed(() => getShopDashProductType(item));

const baseInfoTagStyles: CSSProperties = {
	...styleBorderRadiusLg,
	...styleFlexCenter({
		display: `inline-flex`,
		gap: `6px`,
	}),
	padding: `2px 8px`,
	fontSize: kFontSizeTiny.px,
	fontWeight: `bold`,
	marginTop: `4px`,
};
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
			:style="{
				borderRadius: `${borderRadius}px`,
				overflow: `hidden`,
			}"
			:background-style="{
				backgroundSize: `cover`,
				backgroundPosition: `center`,
			}"
		>
			<AppAspectRatio :ratio="1" />
		</AppBackground>
		<AppStickerPack v-else-if="isInstance(item, StickerPackModel)" :pack="item" />
		<AppStickerLayerDrawerItem
			v-else-if="isInstance(item, StickerModel)"
			:sticker="item"
			no-drag
			hide-count
			fit-parent
		/>

		<!-- Premium/charge tag -->
		<div
			:style="{
				...styleBorderRadiusLg,
				position: `absolute`,
				top: `-12px`,
				right: `-12px`,
				zIndex: 1,
				pointerEvents: `none`,
				transition: `opacity 250ms`,
				...styleWhen(hovered, {
					opacity: 0,
				}),
			}"
		>
			<AppDashShopProductType :product-type="productType" />
		</div>

		<!-- Name -->
		<div
			v-if="item.name"
			:style="{
				...styleLineClamp(2),
				marginTop: `4px`,
				fontWeight: `bold`,
				fontSize: kFontSizeTiny.px,
				textAlign: `center`,
			}"
		>
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
				v-if="itemStates.published"
				:style="{
					...baseInfoTagStyles,
					backgroundColor: kThemeBiBg,
					color: kThemeBiFg,
				}"
			>
				<AppJolticon :style="{ margin: 0, fontSize: `inherit` }" icon="marketplace" />
				{{ $gettext(`Published`) }}
			</div>
			<div
				v-if="itemStates.inReview"
				:style="{
					...baseInfoTagStyles,
					backgroundColor: kThemeFg10,
					color: kThemeFg,
				}"
			>
				<AppJolticon :style="{ margin: 0, fontSize: `inherit` }" icon="clock" />
				{{ $gettext(`In review`) }}
			</div>
			<div
				v-if="itemStates.rejected"
				:style="{
					...baseInfoTagStyles,
					backgroundColor: kThemeGjOverlayNotice,
					color: `white`,
				}"
			>
				<AppJolticon
					:style="{ margin: 0, fontSize: `inherit` }"
					icon="exclamation-circle"
				/>
				{{ $gettext(`Rejected`) }}
			</div>
		</div>
	</div>
</template>
