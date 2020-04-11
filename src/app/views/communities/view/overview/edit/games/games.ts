import Component from 'vue-class-component';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/draggable/draggable.vue';
import AppCardListItem from '../../../../../../../_common/card/list/item/item.vue';
import AppCardList from '../../../../../../../_common/card/list/list.vue';
import { Game } from '../../../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
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
export default class RouteCommunitiesViewEditGames extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	@RouteStoreModule.State
	canLinkNewGames!: RouteStore['canLinkNewGames'];

	@RouteStoreModule.State
	linkGameCount!: RouteStore['linkGameCount'];

	@RouteStoreModule.Mutation
	setCanLinkNewGames!: RouteStore['setCanLinkNewGames'];

	async saveSort(sortedGames: Game[]) {
		// Reorder the games to see the result of the ordering right away.
		this.community.games!.splice(0, this.community.games!.length, ...sortedGames);

		const sortedIds = sortedGames.map(i => i.id);
		try {
			const payload = await this.community.saveGameSort(sortedIds);
			if (payload.success) {
				this.$emit('games-change', this.community.games);
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
					this.$emit('games-change', this.community.games);
					if (this.community.games!.length >= this.linkGameCount) {
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
				this.$emit('games-change', this.community.games);
				// After unlinking a game, there is a free slot and at least one more game to link.
				this.setCanLinkNewGames(true);
			}
		} catch (e) {
			console.error(e);
			Growls.error(this.$gettext(`Failed to unlink game from community.`));
		}
	}
}
