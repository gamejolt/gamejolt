<template>
	<div class="inset-controls-container" ref="container" :style="{ top: this.top }">
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.inset-controls-container
	position: absolute
	right: 0
	transition: top 0.05s ease-in-out
	display: flex
	align-items: center

	& >>> .inset-container-controls
		display: block
		margin-left: 8px

</style>

<script lang="ts" src="./container"></script>
