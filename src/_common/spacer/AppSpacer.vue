<script lang="ts" setup>
defineProps({
	scale: {
		type: Number,
		default: 0,
	},
	scaleSm: {
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
		:class="[
			`-s${scale}`,
			`-s${scaleXs}-xs`,
			`-s${scaleSm}-sm`,
			{ '-h': horizontal, '-v': vertical },
		]"
	/>
</template>

<style lang="stylus" scoped>
$-base = 4px

.-spacer
	flex: none

// Keep the classnames short so that we don't have a huge CSS file.
.-h
	for i in 1..12
		&.-s{i}
			width: i * $-base

.-v
	for i in 1..12
		&.-s{i}
			height: i * $-base

@media $media-sm
	.-h
		for i in 1..12
			&.-s{i}-sm
				width: i * $-base

	.-v
		for i in 1..12
			&.-s{i}-sm
				height: i * $-base

@media $media-xs
	.-h
		for i in 1..12
			&.-s{i}-xs
				width: i * $-base

	.-v
		for i in 1..12
			&.-s{i}-xs
				height: i * $-base
</style>
