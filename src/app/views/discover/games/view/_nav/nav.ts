import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./nav.html';

import { number } from '../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopoverTrigger } from '../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../../lib/gj-lib-client/components/popover/popover';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { RouteState, RouteStore } from '../view.store';
import { ReportModal } from '../../../../../../lib/gj-lib-client/components/report/modal/modal.service';
import { Store } from '../../../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
		AppPopover,
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
	@RouteState commentsCount: RouteStore['commentsCount'];
	@RouteState trophiesCount: RouteStore['trophiesCount'];
	@RouteState hasScores: RouteStore['hasScores'];
	@RouteState primaryScoreTable: RouteStore['primaryScoreTable'];

	@State app: Store['app'];

	Environment = Environment;

	report() {
		ReportModal.show(this.game);
	}
}
