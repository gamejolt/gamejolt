<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { StickerPackRatio } from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { kThemeFg10 } from '../../../../_common/theme/variables';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { kBorderRadiusLg } from '../../../../_styles/variables';
import { ShopManagerGroupItemType } from './RouteDashShop.vue';

const props = defineProps({
	typename: {
		type: String as PropType<ShopManagerGroupItemType>,
		required: true,
	},
	imgUrl: {
		type: String as PropType<string | undefined>,
		required: true,
	},
});

const { typename, imgUrl } = toRefs(props);

const imgData = computed(() => {
	let borderRadius = '';
	let ratio = 1;
	switch (typename.value) {
		case 'Avatar_Frame':
			borderRadius = `50%`;
			break;
		case 'Background':
			borderRadius = kBorderRadiusLg.px;
			break;
		case 'Sticker_Pack':
			borderRadius = kBorderRadiusLg.px;
			ratio = StickerPackRatio;
			break;
		case 'Sticker':
			borderRadius = kBorderRadiusLg.px;
			break;
	}

	return {
		ratio,
		styles: {
			backgroundColor: kThemeFg10,
			borderRadius,
		} as CSSProperties,
	};
});
</script>

<template>
	<div v-if="!imgUrl" :style="{ width: `100%` }">
		<AppAspectRatio :style="imgData.styles" :ratio="imgData.ratio" />
	</div>
	<AppUserAvatarBubble
		v-else-if="typename === 'Avatar_Frame'"
		:user="null"
		:frame-override="{
			image_url: imgUrl,
		}"
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
		<AppAspectRatio :ratio="imgData.ratio" />
	</div>
	<div v-else>
		<AppAspectRatio :ratio="imgData.ratio">
			<img
				:style="[
					imgData.styles,
					{
						width: `100%`,
						height: `100%`,
					},
				]"
			/>
		</AppAspectRatio>
	</div>
</template>
