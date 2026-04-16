<script lang="ts" setup>
import AppContentGif from '../../components/AppContentGif.vue';
import { ContentObject } from '../../content-object';

type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();
</script>

<template>
	<AppContentGif
		:gif-id="contentData.attrs.id"
		:width="contentData.attrs.width"
		:height="contentData.attrs.height"
		:service="contentData.attrs.service"
		:media="contentData.attrs.media"
		:is-editing="false"
		:is-disabled="false"
	/>
</template>
