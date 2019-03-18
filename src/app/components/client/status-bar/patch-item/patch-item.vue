<template>
	<app-progress-bar
		:percent="(pkg.patchProgress || 0) * 100"
		thin
		:style="{ width }"
		:active="pkg.isUnpacking"
		:indeterminate="pkg.isUnpacking"
	/>
</template>

<style lang="stylus" scoped>
.progress
	display: inline-block
	margin: 0 !important

	+ .progress
		margin-left: 1px
</style>

<script lang="ts" src="./patch-item" />
