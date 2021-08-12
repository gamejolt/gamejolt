import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { getAbsoluteLink } from '../../../../../../utils/router';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	getCommentStore,
} from '../../../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../../../_common/comment/modal/modal.service';
import { number } from '../../../../../../_common/filters/number';
import AppPopper from '../../../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../../../_common/report/modal/modal.service';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { copyShareLink } from '../../../../../../_common/share/share.service';
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
		const url = getAbsoluteLink(this.$router, this.game.routeLocation);
		copyShareLink(url);
	}

	report() {
		ReportModal.show(this.game);
	}
}
