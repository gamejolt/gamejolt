<script lang="ts" src="./controls"></script>

<template>
	<app-page-header-controls>
		<app-game-follow-widget :game="game" block show-user-follow location="gamePage" />

		<template #end>
			<app-game-playlist-add-to-widget :game="game" event-label="game-header" />
		</template>
	</app-page-header-controls>
</template>
