<script lang="ts" setup>
defineProps({
	show: {
		type: Boolean,
	},
	inline: {
		type: Boolean,
	},
});
</script>

<template>
	<component
		:is="inline ? 'span' : 'div'"
		class="charge-tooltip-caret"
		:class="{
			'-show-caret': show,
		}"
	>
		<slot />
	</component>
</template>

<style lang="stylus" scoped>
.charge-tooltip-caret
	position: relative

	&.-show-caret::after
		content: ''
		caret(color: black, direction: 'up', size: 8px)
		top: unset
		bottom: -11px
</style>
