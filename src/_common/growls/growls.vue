<script lang="ts" src="./growls"></script>

<template>
	<div class="growl-container">
		<app-growl
			v-for="(growl, index) of Growls.growls"
			:key="index"
			:growl="growl"
			:index="index"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.growl-container
	position: fixed
	bottom: $growl-spacing
	left: 0
	right: 0
	z-index: $zindex-growls

	@media $media-sm-up
		right: auto
		width: $growl-width
</style>
