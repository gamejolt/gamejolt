<script lang="ts" src="./games"></script>

<template>
	<section class="section">
		<div v-if="hasSearch" class="container-xl">
			<app-game-grid
				:games="searchPayload.games"
				:games-count="searchPayload.gamesCount"
				:current-page="searchPayload.page"
				show-ads
				event-label="search-games"
			/>
		</div>
	</section>
</template>
