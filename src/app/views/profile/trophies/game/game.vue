<template>
	<div>
		<div class="row" v-if="game">
			<div class="col-sm-7">
				<app-trophy-completion
					v-if="completion"
					class="-completion"
					:total="completion.totalCount"
					:achieved="completion.achievedCount"
					:experience="completion.experience"
					:is-logged-in-user="isLoggedInUser"
				/>
				<p>
					<app-button :to="game.routeLocation">
						<translate>View Game</translate>
					</app-button>
					<app-button
						:to="{ name: 'discover.games.view.trophies.list', params: game.getSrefParams() }"
					>
						<translate>View All Trophies</translate>
					</app-button>
				</p>
			</div>
			<div class="col-sm-5 hidden-xs">
				<app-game-thumbnail class="-game-thumbnail" :game="game" />
			</div>
		</div>
		<hr class="hidden-xs" />
		<app-trophy-list-paged :initial-trophies="trophies" :url="listLoadMoreUrl" />
	</div>
</template>

<style lang="stylus" scoped>
.-game-thumbnail
	margin-bottom: 0
</style>

<script lang="ts" src="./game"></script>
