<script lang="ts" setup>
import { PropType } from 'vue';
import AppContentGif from '../../components/AppContentGif.vue';
import { ContentObject } from '../../content-object';

defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});
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
