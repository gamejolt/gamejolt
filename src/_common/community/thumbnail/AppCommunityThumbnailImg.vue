<script lang="ts" setup>
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import { Community } from '../community.model';
import { PropType } from 'vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';

defineProps({
	community: {
		type: Object as PropType<Community>,
		required: true,
	},
});
</script>

<template>
	<AppAspectRatio :ratio="1">
		<AppMediaItemBackdrop
			:media-item="community.thumbnail"
			radius="full"
			fallback-color="var(--theme-bg-offset)"
		>
			<AppImgResponsive :src="community.img_thumbnail" alt="" />
		</AppMediaItemBackdrop>
	</AppAspectRatio>
</template>
