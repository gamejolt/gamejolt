<template>
	<div>
		<app-community-perms :community="community" required="community-channels">
			<h2 class="section-header">
				<translate>Linked Games</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Link your games to this community. Doing so will show the game in your community sidebar
						as well as showing the community on your game page. Each of your games can only be
						linked to a single community.
					</translate>
				</p>
			</div>

			<div v-if="canLinkNewGames">
				<app-button block primary @click="onClickLinkGame">
					<translate>Link Game</translate>
				</app-button>
			</div>
			<div v-else>
				<p>
					<translate :translate-params="{ count: maxLinkedGames }">
						Probably some text about how you can only link %{ count } games; or that there are no
						more games left to link.
					</translate>
				</p>
			</div>

			<br />

			<app-card-list v-if="hasLinkedGames" :items="community.games">
				<app-card-list-draggable @change="saveSort">
					<app-card-list-item
						v-for="game in community.games"
						:key="game.id"
						:id="`game-container-${game.id}`"
						:item="game"
					>
						<div class="row">
							<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
								<router-link :to="{ name: game.getSref(), params: game.getSrefParams() }">
									<app-game-thumbnail-img :game="game" />
								</router-link>

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

								<div v-if="!game.isVisible" class="card-meta card-meta-sm">
									<translate
										v-app-tooltip.bottom="
											$gettext(
												`This game is hidden and won't show in the community sidebar until you unhide it.`
											)
										"
									>
										(Hidden)
									</translate>
								</div>
							</div>
						</div>
					</app-card-list-item>
				</app-card-list-draggable>
			</app-card-list>
		</app-community-perms>
	</div>
</template>

<script lang="ts" src="./games"></script>
