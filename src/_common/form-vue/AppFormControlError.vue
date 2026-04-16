<script lang="ts" setup>
import { watch } from 'vue';

import { useFormControlErrors } from '~common/form-vue/AppFormControlErrors.vue';

type Props = {
	when: string;
	message: string;
};
const { when, message } = defineProps<Props>();

const { setOverride } = useFormControlErrors()!;

watch(
	() => message,
	() => setOverride(when, message),
	{ immediate: true }
);
</script>

<template>
	<slot />
</template>
