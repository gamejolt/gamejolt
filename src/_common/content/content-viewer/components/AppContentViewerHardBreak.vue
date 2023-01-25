<script lang="ts" setup>
import { PropType } from 'vue';
import { ContentObject } from '../../content-object';
import { useContentOwnerController } from '../../content-owner';

defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});

const owner = useContentOwnerController()!;
</script>

<template>
	<span v-if="owner.contentRules.inlineParagraphs">{{ ' ' }}</span>
	<br v-else />
</template>
