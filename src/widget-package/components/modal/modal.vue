<script lang="ts" src="./modal"></script>

<template>
	<transition>
		<app-scroll-scroller class="-modal anim-fade-in-shrink anim-fade-leave-enlarge fill-darker">
			<app-button v-if="!hideClose" sm sparse icon="remove" class="-close" @click="close" />
			<slot />
		</app-scroll-scroller>
	</transition>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-modal
	rounded-corners()
	position: absolute
	top: $shell-padding
	right: $shell-padding
	bottom: $shell-padding
	left: $shell-padding
	padding: $grid-gutter-width
	box-shadow: 0 0 5px $black
	border: 1px solid $gray
	z-index: 10

.-close
	float: right
	margin-left: $shell-padding
	margin-bottom: $shell-padding
</style>
