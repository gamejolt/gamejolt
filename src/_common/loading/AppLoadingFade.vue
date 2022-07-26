<script lang="ts" setup>
import AppLoading from './AppLoading.vue';

defineProps({
	isLoading: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="loading-fade" :class="{ 'loading-fade-loading': isLoading }">
		<div v-if="isLoading" class="loading-fade-img">
			<AppLoading centered hide-label stationary />
		</div>
		<div class="loading-fade-content">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.loading-fade
	position: relative

	&-img
		position: absolute
		top: 20px
		left: 0
		right: 0
		z-index: 1

	&-loading

		.loading-fade-content
			opacity: 0.5
			pointer-events: none
</style>
