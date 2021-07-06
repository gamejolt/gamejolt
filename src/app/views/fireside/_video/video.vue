<script lang="ts" src="./video"></script>

<template>
	<div class="-video">
		<div ref="player" class="-video-player" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-video
.-video-player
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
</style>
