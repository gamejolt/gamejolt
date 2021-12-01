<script lang="ts" src="./video"></script>

<template>
	<div class="-video-player">
		<div ref="video" />
		<canvas v-show="!shouldPlayVideo" ref="canvas" />
	</div>
</template>

<style lang="stylus" scoped>
.-video-player
	position: relative

	&
	> *
		width: 100%
		height: 100%

	> *
		position: absolute
</style>
