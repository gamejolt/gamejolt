<script lang="ts" setup>
import { watch } from 'vue';
import { setControlErrorsOverride, useFormControlErrors } from './control-errors.vue';

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

<!-- TODO(vue3): do we need this or can it be templateless? -->
<template>
	<span />
</template>
