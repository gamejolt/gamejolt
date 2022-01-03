<template>
	<div id="shell-hot-bottom">
		<slot></slot>
	</div>
</template>

<style lang="stylus" scoped>
#shell-hot-bottom
	position: fixed
	z-index: $zindex-shell-hot-bottom
</style>

<script lang="ts" src="./hot-bottom"></script>
