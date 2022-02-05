<script lang="ts" setup>
defineProps({
	scale: {
		type: Number,
		default: 0,
	},
	scaleXs: {
		type: Number,
		default: 0,
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
		:class="[`-s${scale}`, `-s${scaleXs}-xs`, { '-h': horizontal, '-v': vertical }]"
	/>
</template>

<style lang="stylus" scoped>
$-base = 4px

.-spacer
	flex: none

// Keep the classnames short so that we don't have a huge CSS file.
.-h
	&.-s1
		width: 1 * $-base

	&.-s2
		width: 2 * $-base

	&.-s3
		width: 3 * $-base

	&.-s4
		width: 4 * $-base

.-v
	&.-s1
		height: 1 * $-base

	&.-s2
		height: 2 * $-base

	&.-s3
		height: 3 * $-base

	&.-s4
		height: 4 * $-base

@media $media-xs
	.-h
		&.-s1-xs
			width: 1 * $-base

		&.-s2-xs
			width: 2 * $-base

		&.-s3-xs
			width: 3 * $-base

		&.-s4-xs
			width: 4 * $-base

	.-v
		&.-s1-xs
			height: 1 * $-base

		&.-s2-xs
			height: 2 * $-base

		&.-s3-xs
			height: 3 * $-base

		&.-s4-xs
			height: 4 * $-base
</style>
