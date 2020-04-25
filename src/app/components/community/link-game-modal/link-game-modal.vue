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
					<div class="-game-thumb">
						<app-game-thumbnail-img :game="game" />
					</div>

					<div class="-game-label">
						<div class="-game-title">{{ game.title }}</div>
						<div v-if="!game.isVisible" class="-game-hidden">
							<span
								v-app-tooltip.bottom="
									$gettext(`Hidden games do not show in the community sidebar`)
								"
								><translate>Hidden</translate></span
							>
						</div>
					</div>

					<div class="-game-button">
						<app-button @click="onClickLink(game)" primary>
							<translate>Link</translate>
						</app-button>
					</div>
				</div>
			</template>
			<div v-else class="page-help">
				<p>
					<translate>
						Text about how there are no games to link, maybe how they are already linked
						to another community.
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
@require '~styles/variables'
@require '~styles-lib/mixins'

$-v-padding = 15px
$-h-padding = 20px
$-height = 44px

.-game
	theme-prop('border-bottom-color', 'bg-subtle')
	display: flex
	align-items: center
	padding: $-v-padding 0
	height: $-height + $-v-padding * 2
	overflow: hidden
	border-bottom-width: $border-width-small
	border-bottom-style: solid

	&:last-child
		border-bottom: 0

	&-thumb
		flex: none
		width: $-height * 2
		margin-right: $-h-padding

	&-label
		flex: auto
		overflow: hidden

	&-title, &-hidden
		text-overflow()

	&-title
		font-weight: bold

	&-hidden
		theme-prop('color', 'fg-muted')
		font-size: $font-size-small

	&-button
		flex: none
		margin-left: $-h-padding
</style>

<script lang="ts" src="./link-game-modal"></script>
