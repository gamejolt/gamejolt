<script lang="ts" setup>
import { PropType } from 'vue';
import { useAdStore } from '../ad-store';
import AppAdGptInner from './AppAdGptInner.vue';

defineProps({
	placement: {
		type: String as PropType<'top' | 'midpage'>,
		required: true,
	},
});

const { shouldShow } = useAdStore();
</script>

<template>
	<AppAdGptInner v-if="shouldShow" :placement="placement" />
</template>
