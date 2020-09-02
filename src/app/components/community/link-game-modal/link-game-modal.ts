import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { Growls } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';

@Component({
	components: {
		AppLoading,
		AppGameThumbnailImg,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityLinkGameModal extends BaseModal {
	@Prop(propRequired(Community)) community!: Community;

	page = 1;
	isLoading = true;
	lastPage = false;
	games: Game[] = [];

	mounted() {
		this.loadPage();
	}

	async loadPage() {
		this.isLoading = true;

		try {
			const payload = await Api.sendRequest(
				'/web/dash/communities/games/list/' + this.community.id + '?page=' + this.page,
				undefined,
				{ noErrorRedirect: true }
			);

			const games = Game.populate(payload.games);
			if (games.length < payload.perPage) {
				this.lastPage = true;
			}
			this.games.push(...games);
		} catch (error) {
			console.error(error);
			Growls.error(this.$gettext(`Failed to load games.`));
			this.modal.resolve();
		}

		this.isLoading = false;
	}

	onClickLoadMore() {
		this.page++;
		this.loadPage();
	}

	onClickLink(game: Game) {
		this.modal.resolve(game);
	}
}
