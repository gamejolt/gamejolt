import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./stats.html?style=./stats.styl';

import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { fuzzynumber } from '../../../../../../../lib/gj-lib-client/vue/filters/fuzzynumber';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { AppExpand } from '../../../../../../../lib/gj-lib-client/components/expand/expand';
import { AppProgressBar } from '../../../../../../../lib/gj-lib-client/components/progress/bar/bar';
import { RouteState, RouteStore } from '../../view.store';

@View
@Component({
	components: {
		AppJolticon,
		AppLazyPlaceholder,
		AppExpand,
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
})
export class AppDiscoverGamesViewOverviewStats extends Vue {
	@RouteState isOverviewLoaded: RouteStore['isOverviewLoaded'];
	@RouteState game: RouteStore['game'];
	@RouteState profileCount: RouteStore['profileCount'];
	@RouteState downloadCount: RouteStore['downloadCount'];
	@RouteState playCount: RouteStore['playCount'];
	@RouteState ratingBreakdown: RouteStore['ratingBreakdown'];
	@RouteState packages: RouteStore['packages'];

	isShowingRatingBreakdown = false;

	number = number;
	fuzzynumber = fuzzynumber;

	get totalPlays() {
		return this.playCount + this.downloadCount;
	}

	get showNaPlays() {
		return !this.packages.length && !this.totalPlays;
	}

	get playsTooltip() {
		if (!this.packages.length) {
			if (this.totalPlays) {
				return this.$gettext(
					`This game used to have playable builds that are no longer available.`
				);
			} else {
				return this.$gettext(`This game doesn't have playable builds yet.`);
			}
		}

		return false;
	}

	get ratingStrings() {
		return [
			this.$gettext('rating.five'),
			this.$gettext('rating.four'),
			this.$gettext('rating.three'),
			this.$gettext('rating.two'),
			this.$gettext('rating.one'),
		];
	}
}
