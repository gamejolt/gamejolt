<script lang="ts" setup>
import { toRefs, useTemplateRef, watch } from 'vue';

const props = defineProps({
	fontDefinitions: {
		type: String,
		required: true,
	},
});

const { fontDefinitions } = toRefs(props);

const styleElem = useTemplateRef('styleElem');

watch(fontDefinitions, onDefinitionsChanged);

function onDefinitionsChanged() {
	if (!styleElem.value) {
		return;
	}

	styleElem.value.innerHTML = fontDefinitions.value;
}
</script>

<template>
	<style ref="styleElem" />
</template>
