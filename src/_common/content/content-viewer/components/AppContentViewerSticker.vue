<script lang="ts" setup>
import AppContentSticker from '~common/content/components/AppContentSticker.vue';
import { ContentObject } from '~common/content/content-object';

type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();
</script>

<template>
	<AppContentSticker
		:key="contentData.attrs.id"
		:sticker-id="contentData.attrs.id"
		:is-charged="contentData.attrs.is_charged === true"
	/>
</template>
