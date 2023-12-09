<script lang="ts" setup>
import { PropType, toRef } from 'vue';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import { MediaItemModel, getMediaItemImageSrc } from './media-item-model';

const props = defineProps({
	mediaItem: {
		type: Object as PropType<MediaItemModel>,
		required: true,
	},
	alt: {
		type: String,
		default: '',
	},
});

const info = toRef(() => getMediaItemImageSrc(props.mediaItem));
</script>

<template>
	<AppImgResponsive v-if="info.isMediaserver" :src="info.src" :alt="alt" />
	<img v-else :src="info.src" :alt="alt" />
</template>
