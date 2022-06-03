<script lang="ts" setup></script>

<template>
	<div class="mobile-tab-bar">
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.mobile-tab-bar
	display: flex
	align-items: center

	> *
		display: inline-flex
		align-items: baseline
		padding: 0 12px
</style>
