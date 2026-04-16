<script lang="ts">
import AppContentCustomButton from '../../components/AppContentCustomButton.vue';
import { ContentObject } from '../../content-object';
</script>

<script lang="ts" setup>
type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();
</script>

<template>
	<AppContentCustomButton
		:key="contentData.attrs.id"
		:custom-button-id="contentData.attrs.id"
		:is-editing="false"
		:is-disabled="false"
	/>
</template>
