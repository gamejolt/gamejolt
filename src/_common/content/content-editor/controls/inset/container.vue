<template>
	<div class="inset-controls-container" ref="container" :style="{ top: this.top + 'px' }">
		<slot v-if="shouldShow" />
	</div>
</template>

<style lang="stylus" scoped>
.inset-controls-container
	position: absolute
	right: 0
	display: flex
	align-items: center

	& >>> .inset-container-controls
		display: block
		margin-left: 8px
</style>

<script lang="ts" src="./container"></script>
