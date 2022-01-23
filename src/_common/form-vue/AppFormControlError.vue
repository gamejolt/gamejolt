<script lang="ts" setup>
import { watch } from 'vue';
import { useFormControlErrors } from './AppFormControlErrors.vue';

const props = defineProps({
	when: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
});

const { setOverride } = useFormControlErrors()!;

watch(
	() => props.message,
	() => setOverride(props.when, props.message),
	{ immediate: true }
);
</script>

<template>
	<slot />
</template>
