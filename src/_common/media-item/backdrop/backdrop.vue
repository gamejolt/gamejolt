<template>
	<div class="img-backdrop" :class="radiusClass">
		<div class="-color" :class="radiusClass" :style="wrapperStyling" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'


.img-backdrop
	display: flex
	overflow: hidden
	width: inherit
	height: 100%
	position: relative

	> *
		position: relative

.-color
	position: absolute
	top: 1px
	right: 1px
	bottom: 1px
	left: 1px
	width: auto
	background-color: white !important

	.spoiler &
		opacity: 0

.-sm
	rounded-corners-sm()

.-md
	rounded-corners()

.-lg
	rounded-corners-lg()

.-full
	border-radius: 50%

</style>

<script lang="ts" src="./backdrop"></script>
