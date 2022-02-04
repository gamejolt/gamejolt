<script lang="ts" setup>
defineProps({
	scale: {
		type: Number,
		required: true,
	},
	horizontal: {
		type: Boolean,
	},
	vertical: {
		type: Boolean,
	},
});
</script>

<template>
	<div
		class="-spacer"
		:class="[`-scale-${scale}`, { '-horizontal': horizontal, '-vertical': vertical }]"
	/>
</template>

<style lang="stylus" scoped>
$-multiplier = 4px

.-spacer
	flex: none

.-horizontal
	&.-scale-1
		width: 1 * $-multiplier

	&.-scale-2
		width: 2 * $-multiplier

	&.-scale-3
		width: 3 * $-multiplier

	&.-scale-4
		width: 4 * $-multiplier

.-vertical
	&.-scale-1
		height: 1 * $-multiplier

	&.-scale-2
		height: 2 * $-multiplier

	&.-scale-3
		height: 3 * $-multiplier

	&.-scale-4
		height: 4 * $-multiplier
</style>
