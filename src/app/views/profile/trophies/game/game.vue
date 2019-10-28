<template>
	<div>
		<template v-if="completion">
			<app-trophy-completion
				class="-completion"
				:total="completion.totalCount"
				:achieved="completion.achievedCount"
				:experience="completion.experience"
			/>
		</template>
		<template v-if="game">
			<div class="-game-links">
				<div>
					<router-link :to="game.routeLocation">
						<app-game-thumbnail-img class="-game-thumbnail" :game="game" />
					</router-link>
				</div>
				<div class="-game-links-nav">
					<router-link :to="game.routeLocation">
						<translate>View game</translate>
					</router-link>
					<br />
					<router-link
						:to="{ name: 'discover.games.view.trophies.list', params: game.getSrefParams() }"
					>
						<translate>View all trophies</translate>
					</router-link>
				</div>
			</div>
		</template>
		<app-trophy-list-paged :initial-trophies="trophies" :url="listLoadMoreUrl" />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-game
	&-links
		display: flex
		align-items: center
		margin-bottom: 32px

		&-nav
			margin-left: 10px

	&-thumbnail
		width: 100px

.-completion
	max-width: 400px
</style>

<script lang="ts" src="./game"></script>
