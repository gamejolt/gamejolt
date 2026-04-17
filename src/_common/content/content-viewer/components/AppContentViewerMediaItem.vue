<script lang="ts" setup>
import AppContentMediaItem from '~common/content/components/AppContentMediaItem.vue';
import { ContentObject } from '~common/content/content-object';

type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();
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
