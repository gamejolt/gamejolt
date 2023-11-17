<script lang="ts" setup>
defineProps({
	num: {
		type: Number,
		required: true,
	},
});
</script>

<template>
	<div>
		<div v-for="i of num" :key="i" class="game-list-item">
			<div class="-thumb">
				<div class="_placeholder-thumb" />
			</div>
			<div class="-meta">
				<div class="_placeholder-title" />
				<div class="_placeholder-dev" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import './list-common'

._placeholder-thumb
	rounded-corners-lg()
	change-bg('bg-subtle')
	position: relative
	height: 0
	padding-top: 56.25% // HD 16:9
	overflow: hidden

._placeholder-title
	lazy-placeholder-block()

._placeholder-dev
	lazy-placeholder-block()
	margin-top: 6px
	width: 60%
</style>
