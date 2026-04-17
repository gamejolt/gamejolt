<script lang="ts" setup>
import { ContentObject } from '~common/content/content-object';
import { useContentOwnerController } from '~common/content/content-owner';

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
