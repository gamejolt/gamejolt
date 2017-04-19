import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./stats.html?style=./stats.styl';

import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { fuzzynumber } from '../../../../../../../lib/gj-lib-client/vue/filters/fuzzynumber';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { GamePackage } from '../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { AppExpand } from '../../../../../../../lib/gj-lib-client/components/expand/expand';
import { AppProgressBar } from '../../../../../../../lib/gj-lib-client/components/progress/bar/bar';
import { RouteState, RouteGetter } from '../../view.state';

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
export class AppDiscoverGamesViewOverviewStats extends Vue
{
	@RouteState isOverviewLoaded: boolean;
	@RouteState game: Game;
	@RouteState profileCount: number;
	@RouteState downloadCount: number;
	@RouteState playCount: number;
	@RouteState ratingBreakdown: number[];

	@RouteGetter packages: GamePackage[];

	isShowingRatingBreakdown = false;

	number = number;
	fuzzynumber = fuzzynumber;

	get totalPlays()
	{
		return this.playCount + this.downloadCount;
	}

	get showNaPlays()
	{
		return !this.packages.length && !this.totalPlays;
	}

	get playsTooltip()
	{
		if ( !this.packages.length ) {
			if ( this.totalPlays ) {
				return this.$gettext( `This game used to have playable builds that are no longer available.` );
			}
			else {
				return this.$gettext( `This game doesn't have playable builds yet.` );
			}
		}

		return false;
	}

	get ratingStrings()
	{
		return [
			this.$gettext( 'rating.five' ),
			this.$gettext( 'rating.four' ),
			this.$gettext( 'rating.three' ),
			this.$gettext( 'rating.two' ),
			this.$gettext( 'rating.one' ),
		];
	}
}
