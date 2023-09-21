<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { StickerPackRatio } from '../../../../../../_common/sticker/pack/AppStickerPack.vue';
import { kThemeFg10 } from '../../../../../../_common/theme/variables';
import AppUserAvatarBubble from '../../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleMaxWidthForOptions } from '../../../../../../_styles/mixins';
import { kBorderRadiusLg } from '../../../../../../_styles/variables';
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
			borderRadius = kBorderRadiusLg.px;
			placeholderRatio = 1.7;
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
		"a a a b b"
		"a a a b b"
		"a a a c ."
	`,
	gridAutoColumns: `1fr`,
	gridAutoRows: `1fr`,
	gap: `12px`,
};
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
		<AppAspectRatio v-else-if="typename === 'Sticker'" :ratio="imgData.placeholderRatio">
			<div :style="stickerGridStyles">
				<div v-for="i in ['a', 'b', 'c']" :key="i" :style="{ gridArea: i }">
					<AppAspectRatio :ratio="1">
						<div :style="[imgData.styles, { padding: `12px` }]">
							<img
								v-if="imgUrl"
								:style="{
									width: `100%`,
									height: `100%`,
								}"
								:src="imgUrl"
							/>
						</div>
					</AppAspectRatio>
				</div>
			</div>
		</AppAspectRatio>
	</div>
</template>
