<script lang="ts" setup>
import { ContentObject } from '../../content-object';
import { useContentOwnerController } from '../../content-owner';

type Props = {
	contentData: ContentObject;
};
defineProps<Props>();

const owner = useContentOwnerController()!;
</script>

<template>
	<span v-if="owner.contentRules.inlineParagraphs">{{ ' ' }}</span>
	<br v-else />
</template>
