import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./nav.html';

import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { number } from '../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopoverTrigger } from '../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../../lib/gj-lib-client/components/popover/popover';
import { AppState } from '../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { RouteState } from '../view.state';
import { ReportModal } from '../../../../../../lib/gj-lib-client/components/report/modal/modal.service';

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
export class AppDiscoverGamesViewNav extends Vue
{
	@RouteState game: Game;
	@RouteState postsCount: number;
	@RouteState commentsCount: number;
	@RouteState trophiesCount: number;
	@RouteState hasScores?: boolean;

	@State app: AppState;

	Environment = Environment;

	report()
	{
		ReportModal.show( this.game );
	}
}
