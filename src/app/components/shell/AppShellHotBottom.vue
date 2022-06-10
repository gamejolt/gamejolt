<script lang="ts" setup></script>

<template>
	<div id="shell-hot-bottom">
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
#shell-hot-bottom
	position: fixed
	z-index: $zindex-shell-hot-bottom
</style>
