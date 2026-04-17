<script lang="ts" setup>
import { useTemplateRef, watch } from 'vue';

type Props = {
	fontDefinitions: string;
};
const { fontDefinitions } = defineProps<Props>();

const styleElem = useTemplateRef('styleElem');

watch(() => fontDefinitions, onDefinitionsChanged);

function onDefinitionsChanged() {
	if (!styleElem.value) {
		return;
	}

	styleElem.value.innerHTML = fontDefinitions;
}
</script>

<template>
	<style ref="styleElem" />
</template>
