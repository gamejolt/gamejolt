<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import {
	AvatarFrameModel,
	DefaultAvatarFrameScale,
} from '../../../../../../_common/avatar/frame.model';
import { Screen } from '../../../../../../_common/screen/screen-service';
import {
	ShopProductModel,
	ShopProductResource,
} from '../../../../../../_common/shop/product/product-model';
import { StickerPackRatio } from '../../../../../../_common/sticker/pack/AppStickerPack.vue';
import AppUserAvatarBubble from '../../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleFlexCenter, styleMaxWidthForOptions } from '../../../../../../_styles/mixins';
import { kBorderRadiusBase, kBorderRadiusLg } from '../../../../../../_styles/variables';
import { isInstance } from '../../../../../../utils/utils';

const props = defineProps({
	resource: {
		type: String as PropType<ShopProductResource>,
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

const { resource, imgUrl } = toRefs(props);

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
			...styleMaxWidthForOptions({
				ratio: imgData.placeholderRatio,
				maxHeight: Math.max(250, Screen.height * 0.3),
			}),
		}"
	>
		<div
			v-if="resource === ShopProductResource.Background"
			:style="[
				imgData.styles,
				{
					backgroundImage: `url(${imgUrl})`,
					backgroundSize: `cover`,
					backgroundPosition: `center`,
				},
			]"
		>
			<AppAspectRatio :ratio="imgData.placeholderRatio" />
		</div>
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
