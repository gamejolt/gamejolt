<script lang="ts" setup>
import { CSSProperties, PropType } from 'vue';
import AppLoading from './AppLoading.vue';

defineProps({
	isLoading: {
		type: Boolean,
	},
	contentStyles: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
});
</script>

<template>
	<div class="loading-fade">
		<div v-if="isLoading" class="loading-fade-img">
			<AppLoading centered hide-label stationary />
		</div>
		<div class="loading-fade-content" :class="{ '-loading': isLoading }" :style="contentStyles">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.loading-fade
	position: relative

.loading-fade-img
	position: absolute
	top: 20px
	left: 0
	right: 0
	z-index: 1

.-loading
	opacity: 0.5
	pointer-events: none
</style>
