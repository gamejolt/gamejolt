<template>
	<div class="img-backdrop" :style="wrapperStyling">
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.img-backdrop
	rounded-corners-lg()
	overflow: hidden
	position: relative
	width: inherit
	height: 100%
	overflow: hidden
	background-clip: content-box
</style>

<script lang="ts" src="./backdrop"></script>
