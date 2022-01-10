<script lang="ts" src="./games"></script>

<template>
	<app-communities-view-page-container>
		<app-community-perms :community="community" required="community-channels">
			<h2 class="section-header">
				<translate>Linked Games</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Link your games to this community. Doing so will show the game in your
						community sidebar as well as showing the community on your game page. Each
						of your games can only be linked to a single community.
					</translate>
				</p>
			</div>

			<div v-if="!canLinkNewGames">
				<p>
					<translate :translate-params="{ count: maxLinkedGames }">
						You've reached the maximum limit of %{ maxLinkedGames } games linked to this
						community.
					</translate>
				</p>
			</div>
			<div v-else-if="!hasMoreGamesToLink">
				<p>
					<translate>
						All your games are linked to a community. Remember, each game can only be
						linked to a single community at this time.
					</translate>
				</p>
			</div>
			<div v-else>
				<app-button block primary @click="onClickLinkGame">
					<translate>Link Game</translate>
				</app-button>
			</div>

			<br />

			<app-card-list v-if="hasLinkedGames" :items="community.games" is-draggable>
				<app-card-list-draggable item-key="id" @change="saveSort">
					<template #item="{ element: game }">
						<app-card-list-item :id="`game-container-${game.id}`" :item="game">
							<div class="row">
								<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
									<router-link
										:to="{ name: game.getSref(), params: game.getSrefParams() }"
									>
										<app-game-thumbnail-img :game="game" />
									</router-link>

									<br class="visible-xs" />
								</div>
								<div class="col-xs-12 col-sm-10">
									<a
										v-app-tooltip="$gettext(`Unlink Game`)"
										class="card-remove"
										@click.stop="onClickUnlinkGame(game)"
									>
										<app-jolticon icon="remove" />
									</a>

									<div class="card-title">
										<h5>{{ game.title }}</h5>
									</div>

									<div v-if="!game.isVisible" class="card-meta card-meta-sm">
										<translate
											v-app-tooltip.bottom="
												$gettext(
													`This game is unlisted and won't show in the community sidebar until you publish it.`
												)
											"
										>
											(Unlisted)
										</translate>
									</div>
								</div>
							</div>
						</app-card-list-item>
					</template>
				</app-card-list-draggable>
			</app-card-list>
		</app-community-perms>
	</app-communities-view-page-container>
</template>
