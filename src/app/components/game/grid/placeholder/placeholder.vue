<script lang="ts" src="./placeholder"></script>

<template>
	<div :class="{ 'scrollable-grid-xs': scrollable }">
		<div class="game-grid-items">
			<div v-for="i of count" :key="i" class="game-grid-item">
				<app-game-thumbnail-placeholder />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../grid'
</style>
