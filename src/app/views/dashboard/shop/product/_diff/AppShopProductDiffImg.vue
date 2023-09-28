<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { StickerPackRatio } from '../../../../../../_common/sticker/pack/AppStickerPack.vue';
import { kThemeFg10 } from '../../../../../../_common/theme/variables';
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
		case 'Avatar_Frame':
			borderRadius = `50%`;
			break;
		case 'Background':
			borderRadius = kBorderRadiusLg.px;
			break;
		case 'Sticker_Pack':
			borderRadius = kBorderRadiusLg.px;
			placeholderRatio = StickerPackRatio;
			break;
		case 'Sticker':
			borderRadius = kBorderRadiusBase.px;
			placeholderRatio = 1.54;
			break;
	}

	return {
		placeholderRatio,
		styles: {
			backgroundColor: kThemeFg10,
			borderRadius,
			width: `100%`,
			height: `100%`,
		} as CSSProperties,
	};
});

const stickerGridStyles: CSSProperties = {
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

function getSizeForStickerGridArea(gridArea: 'a' | 'b' | 'c' | 'd') {
	switch (gridArea) {
		case 'a':
			return 200;
		case 'b':
			return 100;
		case 'c':
			return 64;
		case 'd':
			return 24;
	}
}
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
		<AppUserAvatarBubble
			v-if="typename === 'Avatar_Frame'"
			:user="null"
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
		<div
			v-else-if="typename === 'Background'"
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
		<div v-else-if="typename === 'Sticker'" :style="stickerGridStyles">
			<template v-for="gridArea in (['a', 'b', 'c', 'd'] as const)" :key="gridArea">
				<div v-if="gridArea !== 'd' || Screen.width > 500" :style="{ gridArea }">
					<div :style="imgData.styles">
						<AppAspectRatio
							:ratio="1"
							:inner-styles="[styleFlexCenter(), { padding: `2px` }]"
						>
							<img
								v-if="imgUrl"
								:style="{
									maxWidth: `100%`,
									maxHeight: `100%`,
								}"
								:width="getSizeForStickerGridArea(gridArea)"
								:height="getSizeForStickerGridArea(gridArea)"
								:src="imgUrl"
							/>
						</AppAspectRatio>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>
