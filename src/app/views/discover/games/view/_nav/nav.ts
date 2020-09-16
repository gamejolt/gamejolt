import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Clipboard } from '../../../../../../_common/clipboard/clipboard-service';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	getCommentStore,
} from '../../../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../../../_common/comment/modal/modal.service';
import { Environment } from '../../../../../../_common/environment/environment.service';
import { number } from '../../../../../../_common/filters/number';
import AppPopper from '../../../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../../../_common/report/modal/modal.service';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppGameModLinks from '../../../../../components/game/mod-links/mod-links.vue';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { Store } from '../../../../../store/index';
import { RouteStore, RouteStoreModule } from '../view.store';

@Component({
	components: {
		AppPopper,
		AppGamePerms,
		AppGameModLinks,
	},
	filters: {
		number,
	},
})
export default class AppDiscoverGamesViewNav extends Vue {
	@Inject(CommentStoreManagerKey) commentManager!: CommentStoreManager;

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	trophiesCount!: RouteStore['trophiesCount'];

	@RouteStoreModule.State
	hasScores!: RouteStore['hasScores'];

	@RouteStoreModule.State
	primaryScoreTable!: RouteStore['primaryScoreTable'];

	@State
	app!: Store['app'];

	readonly Screen = Screen;

	get hasAnyPerms() {
		return this.game && this.game.hasPerms();
	}

	get shouldShowModTools() {
		return this.app.user && this.app.user.isMod;
	}

	get commentsCount() {
		if (this.game) {
			const store = getCommentStore(this.commentManager, 'Game', this.game.id);
			return store ? store.totalCount : 0;
		}
		return 0;
	}

	showComments() {
		CommentModal.show({ model: this.game, displayMode: 'comments' });
	}

	copyShareUrl() {
		Clipboard.copy(Environment.baseUrl + this.$router.resolve(this.game.routeLocation).href);
	}

	report() {
		ReportModal.show(this.game);
	}
}
