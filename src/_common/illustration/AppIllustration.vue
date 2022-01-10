<script lang="ts" setup>
import { computed, useSlots } from 'vue';
import AppThemeSvg from '../theme/svg/AppThemeSvg.vue';

defineProps({
	src: {
		type: String,
		required: true,
	},
	sm: {
		type: Boolean,
	},
});

const slots = useSlots();

const hasContent = computed(() => !!slots.default);
</script>

<template>
	<div class="-container">
		<app-theme-svg class="-ill" :src="src" />
		<div v-if="hasContent" class="-text" :class="{ '-sm': sm }">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-font-size-xs = 16px
$-font-size = 19px

.-container
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	text-align: center

.-ill
	margin: $line-height-computed 0
	max-width: 100%

.-text
	color: var(--theme-fg-muted)
	font-size: $-font-size-xs
	max-width: 500px

	@media $media-sm-up
		&:not(.-sm)
			font-size: $-font-size
</style>
