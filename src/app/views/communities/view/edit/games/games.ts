import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../_common/card/list/add/add.vue';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListDraggable from '../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../_common/card/list/item/item.vue';
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
