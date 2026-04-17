<script lang="ts" setup>
import { computed } from 'vue';

import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import { getMediaItemImageSrc, MediaItemModel } from '~common/media-item/media-item-model';

type Props = {
	mediaItem: MediaItemModel;
	alt?: string;
};

const { mediaItem, alt = '' } = defineProps<Props>();

const info = computed(() => getMediaItemImageSrc(mediaItem));
</script>

<template>
	<AppImgResponsive v-if="info.isMediaserver" :src="info.src" :alt="alt" />
	<img v-else :src="info.src" :alt="alt" />
</template>
