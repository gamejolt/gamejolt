<script lang="ts" setup></script>

<template>
	<div class="-toggle-button-group">
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-toggle-button-group
	display: flex
	grid-gap: 8px
</style>
