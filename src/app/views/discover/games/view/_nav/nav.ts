import View from '!view!./nav.html';
import { CommentModal } from 'game-jolt-frontend-lib/components/comment/modal/modal.service';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import {
	CommentState,
	CommentStore,
} from '../../../../../../lib/gj-lib-client/components/comment/comment-store';
import { AppPopover } from '../../../../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { ReportModal } from '../../../../../../lib/gj-lib-client/components/report/modal/modal.service';
import { number } from '../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppGameModLinks } from '../../../../../components/game/mod-links/mod-links';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { Store } from '../../../../../store/index';
import { RouteState, RouteStore } from '../view.store';

@View
@Component({
	components: {
		AppPopover,
		AppGamePerms,
		AppGameModLinks,
	},
	directives: {
		AppPopoverTrigger,
	},
	filters: {
		number,
	},
})
export class AppDiscoverGamesViewNav extends Vue {
	@RouteState
	game!: RouteStore['game'];

	@RouteState
	trophiesCount!: RouteStore['trophiesCount'];

	@RouteState
	hasScores!: RouteStore['hasScores'];

	@RouteState
	primaryScoreTable!: RouteStore['primaryScoreTable'];

	@State
	app!: Store['app'];

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	readonly Screen = Screen;

	get hasAnyPerms() {
		return this.game && this.game.hasPerms();
	}

	get shouldShowModTools() {
		return this.app.user && this.app.user.isMod;
	}

	get commentsCount() {
		if (this.game) {
			const store = this.getCommentStore('Game', this.game.id);
			return store ? store.count : 0;
		}
		return 0;
	}

	showComments() {
		CommentModal.show({ resource: 'Game', resourceId: this.game.id });
	}

	report() {
		ReportModal.show(this.game);
	}
}
