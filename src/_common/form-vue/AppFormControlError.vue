<script lang="ts" setup>
import { watch } from 'vue';
import { setControlErrorsOverride, useFormControlErrors } from './AppFormControlErrors.vue';

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

const errors = useFormControlErrors()!;

watch(
	() => props.message,
	() => setControlErrorsOverride(errors, props.when, props.message),
	{ immediate: true }
);
</script>

<template>
	<slot />
</template>
