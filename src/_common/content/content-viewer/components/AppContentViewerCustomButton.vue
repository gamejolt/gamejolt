<script lang="ts">
import type { PropType } from 'vue';
import AppContentCustomButton from '../../components/AppContentCustomButton.vue';
import { ContentObject } from '../../content-object';
</script>

<script lang="ts" setup>
defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});
</script>

<template>
	<AppContentCustomButton
		:key="contentData.attrs.id"
		:custom-button-id="contentData.attrs.id"
		:is-editing="false"
		:is-disabled="false"
	/>
</template>
