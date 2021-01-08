<script lang="ts" src="./inset-controls"></script>

<template>
	<div ref="container" class="inset-controls-container" :style="{ top: top + 'px' }">
		<slot v-if="shouldShow" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.inset-controls-container
	position: absolute
	display: flex
	align-items: center
	// Offset for the '.form-control' padding
	right: $padding-base-horizontal

	& >>> .inset-container-controls
		display: block
		margin-left: 8px
</style>

