import Component from 'vue-class-component';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/draggable/draggable.vue';
import AppCardListItem from '../../../../../../../_common/card/list/item/item.vue';
import AppCardList from '../../../../../../../_common/card/list/list.vue';
import { Game } from '../../../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip';
import { CommunityLinkGameModal } from '../../../../../../components/community/link-game-modal/link-game-modal.service';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import { RouteStore, RouteStoreModule } from '../edit.store';

@Component({
	name: 'RouteCommunitiesViewEditGames',
	components: {
		AppCommunityPerms,
		AppCardList,
		AppCardListDraggable,
		AppCardListItem,
		AppCardListAdd,
		AppGameThumbnailImg,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver: ({ route }) => Api.sendRequest('/web/dash/communities/games/' + route.params.id),
})
export default class RouteCommunitiesViewEditGames extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	@RouteStoreModule.State
	canLinkNewGames!: RouteStore['canLinkNewGames'];

	@RouteStoreModule.State
	linkGameCount!: RouteStore['linkGameCount'];

	@RouteStoreModule.Mutation
	setCanLinkNewGames!: RouteStore['setCanLinkNewGames'];

	games: Game[] = [];

	get hasLinkedGames() {
		return this.games.length > 0;
	}

	get visibleGames() {
		return this.games.filter(i => i.status === Game.STATUS_VISIBLE);
	}

	routeResolved($payload: any) {
		// Request and populate games so hidden games are also shown.
		this.games = Game.populate($payload.games);
	}

	isGameHidden(game: Game) {
		return game.status !== Game.STATUS_VISIBLE;
	}

	async saveSort(sortedGames: Game[]) {
		// Reorder the games to see the result of the ordering right away.
		this.games!.splice(0, this.games!.length, ...sortedGames);

		const sortedIds = sortedGames.map(i => i.id);
		try {
			const payload = await this.community.saveGameSort(sortedIds);
			if (payload.success) {
				this.$emit('games-change', this.visibleGames);
			}
		} catch (e) {
			console.error(e);
			Growls.error(this.$gettext(`Could not save game arrangement.`));
		}
	}

	async onClickLinkGame() {
		const game = await CommunityLinkGameModal.show(this.community);
		if (game) {
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
					this.community.assign(payload.community);
					this.$emit('games-change', this.visibleGames);
					if (this.games.length >= this.linkGameCount) {
						this.setCanLinkNewGames(false);
					}
				}
			} catch (e) {
				console.error(e);
				Growls.error(this.$gettext(`Failed to link game to community.`));
			}
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
				this.community.assign(payload.community);
				this.$emit('games-change', this.visibleGames);
				// After unlinking a game, there is a free slot and at least one more game to link.
				this.setCanLinkNewGames(true);
			}
		} catch (e) {
			console.error(e);
			Growls.error(this.$gettext(`Failed to unlink game from community.`));
		}
	}
}
