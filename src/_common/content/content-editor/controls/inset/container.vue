<template>
	<div class="inset-controls-container" ref="container" :style="{ top: this.top + 'px' }">
		<slot v-if="shouldShow" />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

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

<script lang="ts" src="./container"></script>
