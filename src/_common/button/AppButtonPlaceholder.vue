<script lang="ts" setup>
defineProps({
	sparse: {
		type: Boolean,
	},
	circle: {
		type: Boolean,
	},
	block: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="button-placeholder" :class="{ sparse, circle, block }" />
</template>

<style lang="stylus" scoped>
.button-placeholder
	rounded-corners()
	change-bg('bg-subtle')
	display: inline-block
	height: $button-md-line-height
	vertical-align: middle
	width: 75px

	&.sparse
		width: $button-md-line-height

	&.circle
		img-circle()

	&.block
		display: block
		width: 100%
</style>
