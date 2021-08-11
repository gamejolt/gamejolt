<script lang="ts" src="./list"></script>

<template>
	<div class="game-list">
		<app-game-list-item
			v-for="game of games"
			:key="game.id"
			:game="game"
			:event-label="eventLabel"
		/>
	</div>
</template>
