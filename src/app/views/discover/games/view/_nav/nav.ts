import { setup } from 'vue-class-component';
import { Inject, Options, Vue } from 'vue-property-decorator';
import { getAbsoluteLink } from '../../../../../../utils/router';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	getCommentStore,
} from '../../../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../../../_common/comment/modal/modal.service';
import { formatNumber } from '../../../../../../_common/filters/number';
import AppPopper from '../../../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../../../_common/report/modal/modal.service';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { copyShareLink } from '../../../../../../_common/share/share.service';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import AppGameModLinks from '../../../../../components/game/mod-links/mod-links.vue';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../view.store';

@Options({
	components: {
		AppPopper,
		AppGamePerms,
		AppGameModLinks,
	},
})
export default class AppDiscoverGamesViewNav extends Vue {
	commonStore = setup(() => useCommonStore());

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	trophiesCount!: RouteStore['trophiesCount'];

	@RouteStoreModule.State
	hasScores!: RouteStore['hasScores'];

	@RouteStoreModule.State
	primaryScoreTable!: RouteStore['primaryScoreTable'];

	get app() {
		return this.commonStore;
	}

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

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
		copyShareLink(url, 'game');
	}

	report() {
		ReportModal.show(this.game);
	}
}