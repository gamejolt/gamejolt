<script lang="ts" setup>
import { PropType } from 'vue';
import AppContentSticker from '../../components/AppContentSticker.vue';
import { ContentObject } from '../../content-object';

defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});
</script>

<template>
	<AppContentSticker
		:key="contentData.attrs.id"
		:sticker-id="contentData.attrs.id"
		:is-charged="contentData.attrs.is_charged === true"
	/>
</template>
