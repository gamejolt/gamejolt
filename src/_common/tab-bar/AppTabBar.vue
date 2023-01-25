<script lang="ts" setup></script>

<template>
	<div class="tab-bar">
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.tab-bar
	display: flex
	align-items: center
	flex-wrap: wrap
	margin-left: -12px
	margin-right: -12px

	> *
		display: inline-flex
		align-items: baseline
		padding-left: 12px
		padding-right: 12px
</style>
