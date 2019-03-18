<template>
	<div
		v-if="hasBanner"
		id="shell-banner"
		class="-banner"
		:class="{
			'-clickable': currentBanner.canClick,
			'fill-highlight': currentBanner.type === 'info',
			'fill-notice': currentBanner.type === 'error',
		}"
		@click="clickBanner()"
	>
		<a class="-close" @click.stop="closeBanner()">
			<app-jolticon icon="remove" />
		</a>

		<div class="-message" v-html="currentBanner.message"></div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-banner
	position: fixed
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)
	height: $shell-top-nav-height
	line-height: $shell-top-nav-height
	z-index: $zindex-shell-top-nav
	font-size: $font-size-small

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)
		text-align: center
		font-size: $font-size-base
		font-weight: bold

	>>> em
		font-style: normal
		text-decoration: underline

.-clickable
	cursor: pointer

.-message
	text-overflow()

.-close
	float: right
	margin-left: 10px

	@media $media-sm-up
		margin-left: 0
</style>

<script lang="ts" src="./banner" />
