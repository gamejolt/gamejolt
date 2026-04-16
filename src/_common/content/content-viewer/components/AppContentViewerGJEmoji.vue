<script lang="ts" setup>
import AppContentEmoji from '~common/content/components/AppContentEmoji.vue';
import { ContentObject } from '~common/content/content-object';

type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();
</script>

<template>
	<AppContentEmoji
		:emoji-id="contentData.attrs.id"
		:emoji-type="contentData.attrs.type"
		show-details
	/>
</template>
