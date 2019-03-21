<template>
	<div :class="{ 'scrollable-grid-xs': scrollable }">
		<div class="game-grid-items">
			<div class="game-grid-item" v-for="i of count" :key="i">
				<app-game-thumbnail-placeholder />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '../grid'
</style>

<script lang="ts" src="./placeholder" />
