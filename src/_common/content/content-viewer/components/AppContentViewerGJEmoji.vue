<script lang="ts" setup>
import { PropType } from 'vue';
import AppContentEmoji from '../../components/AppContentEmoji.vue';
import { ContentObject } from '../../content-object';

defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});
</script>

<template>
	<AppContentEmoji :emoji-id="contentData.attrs.id" :emoji-type="contentData.attrs.type" />
</template>
