<script lang="ts" setup>
import { toRefs } from 'vue';

const props = defineProps({
	opacity: {
		type: Number,
		default: 0.9,
	},
});

const { opacity } = toRefs(props);
</script>

<template>
	<div
		class="-wrapper"
		:style="{
			'background-color': `rgba(var(--theme-bg-offset-rgb), ${opacity})`,
		}"
	>
		<div class="-header">
			<slot name="header" />
		</div>

		<div class="-body">
			<slot name="body" />
		</div>

		<div class="-footer">
			<slot name="footer" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-wrapper
	display: flex
	flex-direction: column
	height: 100%
	transition: background-color 600ms 100ms

.-header
	position: relative
	flex: none
	z-index: 2

.-body
	flex: auto
	display: flex
	flex-direction: column
	max-height: 100%
	overflow: hidden

.-footer
	position: relative
	flex: none
	change-bg('bg')
	z-index: 2
</style>
