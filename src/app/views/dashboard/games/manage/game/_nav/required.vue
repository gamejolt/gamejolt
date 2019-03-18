<template>
	<span class="manage-game-nav-required" v-if="!isComplete">
		<span v-app-tooltip="$gettext(`Required Step`)">
			<app-jolticon notice icon="notice" />
		</span>
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.manage-game-nav-required
	@media $media-md
		position: absolute
		right: -25px

	@media $media-lg
		position: absolute
		right: 0
</style>

<script lang="ts" src="./required" />
