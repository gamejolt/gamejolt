<template>
	<app-page-header-controls>
		<app-game-follow-widget :game="game" block show-user-follow event-label="game-header" />

		<app-game-playlist-add-to-widget slot="end" :game="game" event-label="game-header" />
	</app-page-header-controls>
</template>

<script lang="ts" src="./controls" />
