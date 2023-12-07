<script lang="ts" setup>
import { PropType } from 'vue';
import AppContentMediaItem from '../../components/AppContentMediaItem.vue';
import { ContentObject } from '../../content-object';

defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});
</script>

<template>
	<AppContentMediaItem
		:key="contentData.attrs.id"
		:media-item-id="contentData.attrs.id"
		:media-item-width="contentData.attrs.width"
		:media-item-height="contentData.attrs.height"
		:caption="contentData.attrs.caption"
		:align="contentData.attrs.align"
		:href="contentData.attrs.href"
		:is-editing="false"
	/>
</template>
