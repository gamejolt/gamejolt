<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import {
	styleBorderRadiusLg,
	styleFlexCenter,
	styleMaxWidthForOptions,
	styleWhen,
} from '../../../_styles/mixins';
import { kFontSizeSmall } from '../../../_styles/variables';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import { DefaultAvatarFrameScale } from '../../avatar/frame.model';
import AppBackgroundFade from '../../background/AppBackgroundFade.vue';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import { Screen } from '../../screen/screen-service';
import { useCommonStore } from '../../store/common-store';
import { kThemeFgMuted } from '../../theme/variables';
import { UserModel } from '../../user/user.model';
import AppUserAvatarBubble from '../../user/user-avatar/AppUserAvatarBubble.vue';
import {
	getReadablePurchasableProductType,
	NormalizedProductData,
	PurchasableProductType,
} from './product-owner-helpers';

type Props = {
	productData: NormalizedProductData;
	avatarFrameUser?: UserModel;
};
const { productData, avatarFrameUser } = defineProps<Props>();

const { user: authUser } = useCommonStore();

const frameOverride = computed(() => {
	if (
		!productData.imgUrl ||
		productData.resource !== PurchasableProductType.AvatarFrame
	) {
		return undefined;
	}
	return {
		image_url: productData.imgUrl,
		scale: productData.scale ?? DefaultAvatarFrameScale,
	};
});

const itemWidthStyles = computed(() => {
	return {
		...styleMaxWidthForOptions({
			ratio: productData.aspectRatio,
			maxWidth: 320,
			maxHeight: Screen.height / 3,
		}),
		width: `100%`,
	} satisfies CSSProperties;
});
</script>

<template>
	<div :style="{ ...styleFlexCenter({ direction: `column` }), width: `100%` }">
		<div :style="itemWidthStyles">
			<AppUserAvatarBubble
				v-if="productData.resource === 'Avatar_Frame'"
				:user="avatarFrameUser || authUser"
				:frame-override="frameOverride"
				:show-frame="!!frameOverride"
				smoosh
				disable-link
			/>
			<AppAspectRatio
				v-else
				v-bind="{
					ratio: productData.aspectRatio,
					style: styleWhen(
						productData.resource === PurchasableProductType.Background,
						styleBorderRadiusLg
					),
				}"
			>
				<AppImgResponsive
					v-if="productData.imgUrl && productData.processMediaserverUrl"
					:style="{
						width: `100%`,
						height: `100%`,
					}"
					:src="productData.imgUrl"
					alt=""
				/>
				<img
					v-else
					:style="{
						width: `100%`,
						height: `100%`,
					}"
					:src="productData.imgUrl"
					alt=""
				/>
				<AppBackgroundFade v-if="productData.resource === 'Background'" />
			</AppAspectRatio>
		</div>

		<div
			:style="{
				marginTop: `8px`,
				alignSelf: `center`,
				color: kThemeFgMuted,
				fontSize: kFontSizeSmall.px,
			}"
		>
			{{ getReadablePurchasableProductType(productData.resource) }}
		</div>

		<div
			v-if="productData.name"
			:style="{
				fontWeight: 700,
			}"
		>
			{{ productData.name }}
		</div>
	</div>
</template>
