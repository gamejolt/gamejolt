<script lang="ts" src="./shaka"></script>

<template>
	<div class="-shaka">
		<video ref="video" :poster="player.poster" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

>>> video
	display: block
	width: 100%
</style>
