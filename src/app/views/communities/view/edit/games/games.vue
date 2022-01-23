<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../_common/card/list/AppCardListItem.vue';
import { Game } from '../../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { CommunityLinkGameModal } from '../../../../../components/community/link-game-modal/link-game-modal.service';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

@Options({
	name: 'RouteCommunitiesViewEditGames',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
		AppCardList,
		AppCardListItem,
		AppCardListDraggable,
		AppCardListAdd,
		AppGameThumbnailImg,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/games/' + route.params.id);
	},
})
export default class RouteCommunitiesViewEditGames extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	maxLinkedGames = 10;
	hasMoreGamesToLink = false;

	get community() {
		return this.routeStore.community;
	}

	get hasLinkedGames() {
		return this.community.games && this.community.games.length > 0;
	}

	get canLinkNewGames() {
		return this.community.games && this.community.games.length < this.maxLinkedGames;
	}

	routeResolved($payload: any) {
		this.hasMoreGamesToLink = !!$payload.hasMoreGamesToLink;
		this.maxLinkedGames = $payload.maxLinkedGames;
	}

	async saveSort(sortedGames: Game[]) {
		// Reorder the games to see the result of the ordering right away.
		this.community.games!.splice(0, this.community.games!.length, ...sortedGames);

		try {
			await this.community.saveGameSort();
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Could not save game arrangement.`));
		}
	}

	async onClickLinkGame() {
		const game = await CommunityLinkGameModal.show(this.community);
		if (!game) {
			return;
		}

		try {
			const payload = await Api.sendRequest(
				'/web/dash/communities/games/link',
				{
					community_id: this.community.id,
					game_id: game.id,
				},
				{ noErrorRedirect: true }
			);

			if (payload.success) {
				this.community.games = Game.populate(payload.community.games);
			}
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Failed to link game to community.`));
		}
	}

	async onClickUnlinkGame(game: Game) {
		try {
			const payload = await Api.sendRequest(
				'/web/dash/communities/games/unlink',
				{
					community_id: this.community.id,
					game_id: game.id,
				},
				{ noErrorRedirect: true }
			);

			if (payload.success) {
				this.community.games = Game.populate(payload.community.games);
				// After unlinking a game, there is a free slot and at least one
				// more game to link.
				this.hasMoreGamesToLink = true;
			}
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Failed to unlink game from community.`));
		}
	}
}
</script>

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
