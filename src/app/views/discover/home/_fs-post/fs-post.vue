<script lang="ts" src="./fs-post"></script>

<template>
	<div class="-fs-post">
		<div class="-backdrop">
			<app-img-responsive
				class="-backdrop-img"
				:class="{
					'-loaded': imgLoaded,
				}"
				:src="mediaItem.mediaserver_url"
				alt=""
				@imgloadchange="onImageLoad"
			/>
		</div>

		<div class="-shade" />

		<template v-if="videoController">
			<app-video
				class="-video"
				:player="videoController"
				should-play
				allow-degraded-autoplay
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-fs-post
.-backdrop
.-shade
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0

.-backdrop-img
	position: relative
	width: 100%
	height: 100%
	object-fit: cover
	opacity: 0
	transition-duration: 1s

	&.-loaded
		opacity: 1

.-shade
	background-color: rgba(0, 0, 0, 0.5)

.-video
	position: relative
	width: 100%
	height: 100%

	>>> > video
		height: 100% !important
		width: 100% !important
		object-fit: cover
</style>
