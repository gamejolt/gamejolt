<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue';

const props = defineProps({
	fontDefinitions: {
		type: String,
		required: true,
	},
});

const { fontDefinitions } = toRefs(props);

const styleElem = ref<HTMLStyleElement | null>(null);

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
