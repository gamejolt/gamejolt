<script lang="ts" src="./video"></script>

<template>
	<div class="-video-player">
		<div ref="video" :class="{ '-hide': !shouldPlayVideo }" />
		<canvas ref="canvas" :class="{ '-hide': shouldPlayVideo }" />
	</div>
</template>

<style lang="stylus" scoped>
.-hide
	display: none
	visibility: hidden

.-video-player
	position: relative

	&
	> *
		width: 100%
		height: 100%

	> *
		position: absolute
</style>
