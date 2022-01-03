<script lang="ts" src="./toast"></script>

<template>
	<div
		class="-toast"
		:class="{
			'fill-pink': type === 'error',
		}"
		@mouseenter="focus"
		@mouseleave="blur"
	>
		<a class="-close" @click="dismiss">
			<app-jolticon icon="remove" />
		</a>
		<app-jolticon v-if="type === 'error'" icon="notice" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-toast
	rounded-corners()
	position: absolute
	bottom: 0
	left: $shell-padding * 2
	right: @left
	padding: 7px 10px
	z-index: 1000

.-close
	float: right
	margin-left: 10px
</style>
