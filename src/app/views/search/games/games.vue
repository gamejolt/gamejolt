<template>
	<section class="section">
		<div class="container-xl" v-if="hasSearch">
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

<script lang="ts" src="./games"></script>
