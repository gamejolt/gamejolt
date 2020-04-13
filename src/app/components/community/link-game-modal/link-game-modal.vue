<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Link a Game</translate>
			</h2>
		</div>
		<div class="modal-body">
			<div class="page-help">
				<p>
					<translate>
						Some text about linking a game.
					</translate>
				</p>
			</div>

			<template v-if="games.length">
				<div v-for="game of games" :key="game.id" class="-game">
					<span class="-game-thumb">
						<app-game-thumbnail-img :game="game" />
					</span>
					<div class="-game-meta">
						<span class="-game-title">{{ game.title }}</span>
						<br />
						<app-button @click="onClickLink(game)">
							<translate>Link</translate>
						</app-button>
					</div>
				</div>
			</template>
			<div v-else class="page-help">
				<p>
					<translate>
						Text about how there are no games to link, maybe how they are already linked to another
						community.
					</translate>
				</p>
			</div>

			<app-loading v-if="isLoading" centered />
			<template v-else-if="!lastPage">
				<div class="page-cut">
					<app-button @click="onClickLoadMore">
						<translate>Load More</translate>
					</app-button>
				</div>
			</template>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
.-game
	display: flex
	margin-bottom: 12px

	&-thumb
		width: 45%
		max-width: 200px

	&-meta
		margin-left: 12px

	&-title
		font-weight: bold

</style>

<script lang="ts" src="./link-game-modal"></script>
