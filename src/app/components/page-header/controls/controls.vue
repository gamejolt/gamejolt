<template>
	<div class="-controls">
		<div class="-start">
			<slot name="start" />
		</div>
		<div class="-full">
			<slot />
		</div>
		<div class="-end">
			<slot name="end" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-controls
	display: flex
	align-items: center

	.-start, .-end
		flex: none

	.-start
		margin-right: 5px

	.-end
		margin-left: 5px

	.-full
		flex: auto

		@media $media-sm
			flex: none

		@media $media-md
			flex: none
</style>

<script lang="ts" src="./controls"></script>
