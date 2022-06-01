<script lang="ts" setup></script>

<template>
	<div class="-button-stack">
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-button-stack
	> ::v-deep(*)
		margin: 0 !important

		&:first-child
			border-bottom-left-radius: 0
			border-bottom-right-radius: 0

		&:not(:first-child):not(:last-child)
			border-radius: 0

		&:last-child
			border-top-left-radius: 0
			border-top-right-radius: 0
</style>
