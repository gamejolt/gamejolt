<script lang="ts" setup>
import AppContentEmbed from '~common/content/components/embed/AppContentEmbed.vue';
import { ContentObject } from '~common/content/content-object';

type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();
</script>

<template>
	<template v-if="!contentData.attrs.type || !contentData.attrs.source">
		<div />
	</template>
	<template v-else>
		<AppContentEmbed
			:type="contentData.attrs.type"
			:source="contentData.attrs.source"
			:is-editing="false"
		/>
	</template>
</template>
