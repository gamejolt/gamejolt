<script lang="ts" setup>
import { useAdStore } from '../ad-store';
import AppAdGptInner from './AppAdGptInner.vue';

type Props = {
	placement: 'top' | 'midpage';
};

defineProps<Props>();

const { shouldShow } = useAdStore();
</script>

<template>
	<AppAdGptInner v-if="shouldShow" :placement="placement" />
</template>
