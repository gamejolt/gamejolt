<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../_common/card/list/AppCardListItem.vue';
import { $saveCommunityGameSort } from '../../../../../../_common/community/community.model';
import { GameModel } from '../../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { showCommunityLinkGameModal } from '../../../../../components/community/link-game-modal/link-game-modal.service';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';

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
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/games/' + route.params.id);
	},
})
export default class RouteCommunitiesViewEditGames extends LegacyRouteComponent {
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

	async saveSort(sortedGames: GameModel[]) {
		// Reorder the games to see the result of the ordering right away.
		this.community.games!.splice(0, this.community.games!.length, ...sortedGames);

		try {
			await $saveCommunityGameSort(this.community);
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Could not save game arrangement.`));
		}
	}

	async onClickLinkGame() {
		const game = await showCommunityLinkGameModal(this.community);
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
				this.community.games = GameModel.populate(payload.community.games);
			}
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Failed to link game to community.`));
		}
	}

	async onClickUnlinkGame(game: GameModel) {
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
				this.community.games = GameModel.populate(payload.community.games);
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
	<AppCommunitiesViewPageContainer>
		<AppCommunityPerms :community="community" required="community-channels">
			<h2 class="section-header">
				<AppTranslate>Linked Games</AppTranslate>
			</h2>

			<div class="page-help">
				<p>
					<AppTranslate>
						Link your games to this community. Doing so will show the game in your
						community sidebar as well as showing the community on your game page. Each
						of your games can only be linked to a single community.
					</AppTranslate>
				</p>
			</div>

			<div v-if="!canLinkNewGames">
				<p>
					<AppTranslate :translate-params="{ count: maxLinkedGames }">
						You've reached the maximum limit of %{ maxLinkedGames } games linked to this
						community.
					</AppTranslate>
				</p>
			</div>
			<div v-else-if="!hasMoreGamesToLink">
				<p>
					<AppTranslate>
						All your games are linked to a community. Remember, each game can only be
						linked to a single community at this time.
					</AppTranslate>
				</p>
			</div>
			<div v-else>
				<AppButton block primary @click="onClickLinkGame">
					<AppTranslate>Link Game</AppTranslate>
				</AppButton>
			</div>

			<br />

			<AppCardList v-if="hasLinkedGames" :items="community.games" is-draggable>
				<AppCardListDraggable item-key="id" @change="saveSort">
					<template #item="{ element: game }">
						<AppCardListItem :id="`game-container-${game.id}`" :item="game">
							<div class="row">
								<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
									<router-link
										:to="{ name: game.getSref(), params: game.getSrefParams() }"
									>
										<AppGameThumbnailImg :game="game" />
									</router-link>

									<br class="visible-xs" />
								</div>
								<div class="col-xs-12 col-sm-10">
									<a
										v-app-tooltip="$gettext(`Unlink Game`)"
										class="card-remove"
										@click.stop="onClickUnlinkGame(game)"
									>
										<AppJolticon icon="remove" />
									</a>

									<div class="card-title">
										<h5>{{ game.title }}</h5>
									</div>

									<div v-if="!game.isVisible" class="card-meta card-meta-sm">
										<AppTranslate
											v-app-tooltip.bottom="
												$gettext(
													`This game is unlisted and won't show in the community sidebar until you publish it.`
												)
											"
										>
											(Unlisted)
										</AppTranslate>
									</div>
								</div>
							</div>
						</AppCardListItem>
					</template>
				</AppCardListDraggable>
			</AppCardList>
		</AppCommunityPerms>
	</AppCommunitiesViewPageContainer>
</template>
