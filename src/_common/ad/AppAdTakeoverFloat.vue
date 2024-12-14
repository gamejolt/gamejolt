<script lang="ts" setup>
import { useAdStore } from './ad-store';

defineProps({
	allowThemeChange: {
		type: Boolean,
		default: false,
	},
});

const { hasTakeover } = useAdStore();
</script>

<template>
	<div
		:style="{
			position: `relative`,
			zIndex: `1`,
		}"
		:class="{ 'theme-dark': allowThemeChange && hasTakeover }"
	>
		<slot />
	</div>
</template>
