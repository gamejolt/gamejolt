<script lang="ts" setup>
import { PropType } from 'vue';
import AppContentEmbed from '../../components/embed/AppContentEmbed.vue';
import { ContentObject } from '../../content-object';

defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});
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
