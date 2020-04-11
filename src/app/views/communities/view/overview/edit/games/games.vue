<template>
	<div>
		<app-community-perms :community="community" required="community-channels">
			<h2 class="section-header">
				<translate>Linked Games</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Link your games to your community to do something something more flavor text here.
						Probably something about how the community appears on the game page, and the game
						appears in the sidebar. Also maybe that hidden games don't appear in the sidebar, but
						the community does appear on the game page
					</translate>
				</p>
			</div>

			<div v-if="canLinkNewGames">
				<app-button icon="add" @click="onClickLinkGame">
					<translate>Link Game</translate>
				</app-button>
			</div>
			<div v-else>
				<p>
					<translate :translate-params="{ count: linkGameCount }">
						Probably some text about how you can only link %{ count } games; or that there are no
						more games left to link.
					</translate>
				</p>
			</div>

			<br />

			<div v-if="!community.games">
				<p>
					<translate>There are currently no games linked.</translate>
				</p>
			</div>
			<app-card-list v-else :items="community.games">
				<app-card-list-draggable @change="saveSort">
					<app-card-list-item
						v-for="game in community.games"
						:key="game.id"
						:id="`game-container-${game.id}`"
						:item="game"
					>
						<div class="row">
							<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
								<app-game-thumbnail-img :game="game" />

								<br class="visible-xs" />
							</div>
							<div class="col-xs-12 col-sm-10">
								<a
									class="card-remove"
									@click.stop="onClickUnlinkGame(game)"
									v-app-tooltip="$gettext(`Unlink Game`)"
								>
									<app-jolticon icon="remove" />
								</a>

								<div class="card-title">
									<h5>{{ game.title }}</h5>
								</div>
							</div>
						</div>
					</app-card-list-item>
				</app-card-list-draggable>
			</app-card-list>
		</app-community-perms>
	</div>
</template>

<style lang="stylus" scoped>

</style>

<script lang="ts" src="./games"></script>
