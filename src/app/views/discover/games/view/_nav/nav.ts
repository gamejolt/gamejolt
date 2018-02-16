import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./nav.html';

import { number } from '../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopoverTrigger } from '../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../../lib/gj-lib-client/components/popover/popover';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { RouteState, RouteStore } from '../view.store';
import { ReportModal } from '../../../../../../lib/gj-lib-client/components/report/modal/modal.service';
import { Store } from '../../../../../store/index';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { AppGameModLinks } from '../../../../../components/game/mod-links/mod-links';
import {
	CommentStore,
	CommentState,
} from '../../../../../../lib/gj-lib-client/components/comment/comment-store';

@View
@Component({
	components: {
		AppJolticon,
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
	@RouteState game: RouteStore['game'];
	@RouteState postsCount: RouteStore['postsCount'];
	@RouteState trophiesCount: RouteStore['trophiesCount'];
	@RouteState hasScores: RouteStore['hasScores'];
	@RouteState primaryScoreTable: RouteStore['primaryScoreTable'];

	@State app: Store['app'];

	@CommentState getCommentStore: CommentStore['getCommentStore'];

	Environment = Environment;

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

	report() {
		ReportModal.show(this.game);
	}
}
