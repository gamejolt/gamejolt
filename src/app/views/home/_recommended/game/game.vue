<script lang="ts" src="./game"></script>

<template>
	<div>
		<div v-if="isLoading" class="-recommended-game">
			<app-game-thumbnail-placeholder />
		</div>
		<div v-else-if="game" class="-recommended-game">
			<app-game-thumbnail :game="game" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-recommended-game
	margin-bottom: $line-height-computed

	>>> .game-thumbnail
		margin-bottom: 0

	>>> .game-thumbnail-placeholder
		margin-bottom: 0
</style>
