<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { StickerPackRatio } from '../../../../../../_common/sticker/pack/AppStickerPack.vue';
import AppUserAvatarBubble from '../../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleFlexCenter, styleMaxWidthForOptions } from '../../../../../../_styles/mixins';
import { kBorderRadiusBase, kBorderRadiusLg } from '../../../../../../_styles/variables';
import { ShopManagerGroupItemType } from '../../shop.store';

const props = defineProps({
	typename: {
		type: String as PropType<ShopManagerGroupItemType>,
		required: true,
	},
	imgUrl: {
		type: [String, null] as PropType<string | null>,
		required: true,
	},
});

const { typename, imgUrl } = toRefs(props);

const imgData = computed(() => {
	let borderRadius = '';
	let placeholderRatio = 1;
	switch (typename.value) {
		case 'Background':
			borderRadius = kBorderRadiusLg.px;
			break;
		case 'Sticker_Pack':
			borderRadius = kBorderRadiusLg.px;
			placeholderRatio = StickerPackRatio;
			break;
		// They're displayed the same way.
		case 'Avatar_Frame':
		case 'Sticker':
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

const gridAreaSizes: Record<
	Exclude<ShopManagerGroupItemType, 'Background' | 'Sticker_Pack'>,
	{ a: number; b: number; c: number; d: number }
> = {
	Avatar_Frame: {
		a: 200,
		b: 100,
		c: 64,
		d: 24,
	},
	Sticker: {
		a: 200,
		b: 100,
		c: 64,
		d: 24,
	},
} as const;
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
			v-if="typename === 'Background'"
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
		<AppAspectRatio v-else-if="typename === 'Sticker_Pack'" :ratio="imgData.placeholderRatio">
			<img v-if="imgUrl" :style="imgData.styles" :src="imgUrl" />
			<div v-else :style="imgData.styles" />
		</AppAspectRatio>
		<div
			v-else-if="typename === 'Sticker' || typename === 'Avatar_Frame'"
			:style="multiSizeGridStyles"
		>
			<template v-for="gridArea in (['a', 'b', 'c', 'd'] as const)" :key="gridArea">
				<div v-if="gridArea !== 'd' || Screen.width > 500" :style="{ gridArea }">
					<div :style="imgData.styles">
						<AppAspectRatio
							:ratio="1"
							:inner-styles="[styleFlexCenter(), { padding: `2px` }]"
						>
							<template v-if="typename === 'Sticker'">
								<img
									v-if="imgUrl"
									:style="{
										maxWidth: `100%`,
										maxHeight: `100%`,
									}"
									:width="gridAreaSizes[typename][gridArea]"
									:height="gridAreaSizes[typename][gridArea]"
									:src="imgUrl"
								/>
							</template>
							<template v-else>
								<AppUserAvatarBubble
									:user="null"
									:style="{
										width: `${gridAreaSizes[typename][gridArea]}px`,
										height: `${gridAreaSizes[typename][gridArea]}px`,
										maxWidth: `100%`,
										maxHeight: `100%`,
									}"
									:frame-override="
										imgUrl
											? {
													image_url: imgUrl,
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
