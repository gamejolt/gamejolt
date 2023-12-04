<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import {
	AvatarFrameModel,
	DefaultAvatarFrameScale,
} from '../../../../../../_common/avatar/frame.model';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../../../_common/scroll/AppScrollScroller.vue';
import {
	ShopProductModel,
	ShopProductResource,
} from '../../../../../../_common/shop/product/product-model';
import { StickerPackRatio } from '../../../../../../_common/sticker/pack/AppStickerPack.vue';
import AppUserAvatarBubble from '../../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import {
	styleFlexCenter,
	styleMaxWidthForOptions,
	styleWhen,
} from '../../../../../../_styles/mixins';
import { kBorderRadiusBase, kBorderRadiusLg } from '../../../../../../_styles/variables';
import { isInstance } from '../../../../../../utils/utils';
import { ShopProductBaseForm } from '../_forms/FormShopProductBase.vue';

const props = defineProps({
	resource: {
		type: String as PropType<ShopProductResource>,
		required: true,
	},
	form: {
		type: Object as PropType<ShopProductBaseForm>,
		required: true,
	},
	model: {
		type: Object as PropType<ShopProductModel>,
		default: undefined,
	},
	imgUrl: {
		type: String,
		default: undefined,
	},
});

const { resource, form, model, imgUrl } = toRefs(props);

const backgroundData = computed(() => {
	if (resource.value !== ShopProductResource.Background) {
		return undefined;
	}
	return form.value.getBackgroundSize(model?.value ?? imgUrl?.value);
});

const scrollableBackgroundSize = computed(() => {
	const { tileSize } = backgroundData.value || {};
	const { width, height } = tileSize || {};

	if (!height && !width) {
		return undefined;
	}

	// Ensure that this amount of the background is visible when tiling.
	//
	// NOTE: This doesn't check that the background is fully visible based on
	// the device viewport size, only that we build the image viewport to show
	// this amount. Users may be required to scroll both vertically and
	// horizontally to view one full image.
	const visibleAmount = 1.5;

	return {
		width: `${(width ?? height)! * visibleAmount}px`,
		height: `${(height ?? width)! * visibleAmount}px`,
	};
});

const imgData = computed(() => {
	let borderRadius = '';
	let placeholderRatio = 1;
	switch (resource.value) {
		case ShopProductResource.Background:
			borderRadius = kBorderRadiusLg.px;
			break;

		case ShopProductResource.StickerPack:
			borderRadius = kBorderRadiusLg.px;
			placeholderRatio = StickerPackRatio;
			break;

		// They're displayed the same way.
		case ShopProductResource.AvatarFrame:
		case ShopProductResource.Sticker:
			borderRadius = kBorderRadiusBase.px;
			placeholderRatio = 1.54;
			break;
	}

	return {
		placeholderRatio,
		styles: {
			borderRadius,
			width: `100%`,
			height: `100%`,
		} as CSSProperties,
	};
});

const multiSizeGridStyles: CSSProperties = {
	display: `grid`,
	gridTemplateAreas: `
		"a a a a a a b b b"
		"a a a a a a b b b"
		"a a a a a a b b b"
		"a a a a a a c c d"
		"a a a a a a c c ."
		"a a a a a a . . ."
	`,
	gridAutoColumns: `1fr`,
	gridAutoRows: `1fr`,
	gap: `8px`,
};

const gridAreaSizes = {
	[ShopProductResource.AvatarFrame]: {
		a: 200,
		b: 100,
		c: 64,
		d: 24,
	},
	[ShopProductResource.Sticker]: {
		a: 200,
		b: 100,
		c: 64,
		d: 24,
	},
} as const satisfies Record<any, { a: number; b: number; c: number; d: number }>;
</script>

<template>
	<div
		:style="{
			width: `100%`,
			alignSelf: `center`,
			// Can't clamp our image sizes if we're tiling a background.
			...styleWhen(
				!backgroundData?.tileSize,
				styleMaxWidthForOptions({
					ratio: imgData.placeholderRatio,
					maxHeight: Math.max(250, Screen.height * 0.3),
				})
			),
		}"
	>
		<template v-if="resource === ShopProductResource.Background">
			<AppScrollScroller
				v-if="backgroundData?.tileSize"
				:style="{
					...styleWhen(!!scrollableBackgroundSize, {
						height: scrollableBackgroundSize?.height,
					}),
				}"
				horizontal
			>
				<div
					:style="[
						imgData.styles,
						backgroundData.styles,
						styleWhen(!!scrollableBackgroundSize, {
							width: scrollableBackgroundSize!.width,
							height: `100%`,
						}),
					]"
				>
					<AppAspectRatio :ratio="imgData.placeholderRatio" />
				</div>
			</AppScrollScroller>
			<div
				v-else
				:style="[imgData.styles, styleWhen(!!backgroundData, backgroundData!.styles)]"
			>
				<AppAspectRatio :ratio="imgData.placeholderRatio" />
			</div>
		</template>
		<AppAspectRatio
			v-else-if="resource === ShopProductResource.StickerPack"
			:ratio="imgData.placeholderRatio"
		>
			<img v-if="imgUrl" :style="imgData.styles" :src="imgUrl" />
			<div v-else :style="imgData.styles" />
		</AppAspectRatio>
		<div
			v-else-if="
				resource === ShopProductResource.Sticker ||
				resource === ShopProductResource.AvatarFrame
			"
			:style="multiSizeGridStyles"
		>
			<template v-for="gridArea in (['a', 'b', 'c', 'd'] as const)" :key="gridArea">
				<div v-if="gridArea !== 'd' || Screen.width > 500" :style="{ gridArea }">
					<div :style="imgData.styles">
						<AppAspectRatio
							:ratio="1"
							:inner-styles="[styleFlexCenter(), { padding: `2px` }]"
						>
							<template v-if="resource === ShopProductResource.Sticker">
								<img
									v-if="imgUrl"
									:style="{
										maxWidth: `100%`,
										maxHeight: `100%`,
									}"
									:width="gridAreaSizes[resource][gridArea]"
									:height="gridAreaSizes[resource][gridArea]"
									:src="imgUrl"
								/>
							</template>
							<template v-else>
								<AppUserAvatarBubble
									:user="null"
									:style="{
										width: `${gridAreaSizes[resource][gridArea]}px`,
										height: `${gridAreaSizes[resource][gridArea]}px`,
										maxWidth: `100%`,
										maxHeight: `100%`,
									}"
									:frame-override="
										imgUrl
											? {
													image_url: imgUrl,
													scale:
														model && isInstance(model, AvatarFrameModel)
															? model.scale
															: DefaultAvatarFrameScale,
											  }
											: undefined
									"
									smoosh
									show-frame
								/>
							</template>
						</AppAspectRatio>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>
