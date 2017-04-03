import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./grid.html';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppGameThumbnail } from '../thumbnail/thumbnail';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppPagination } from '../../../../lib/gj-lib-client/components/pagination/pagination';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';

const RowSizeSm = 2;
const RowSizeMd = 3;
const RowSizeLg = 4;

let idCounter = 0;

@View
@Component({
	components: {
		AppGameThumbnail,
		AppPagination,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppGameGrid extends Vue
{
	@Prop( { type: Array, default: () => [] } ) games: Game[];
	@Prop( Number ) gamesCount?: number;
	@Prop( Number ) perPage?: number;
	@Prop( Boolean ) truncateToFit?: boolean;
	@Prop( Boolean ) scrollable?: boolean;
	@Prop( String ) eventLabel?: string;

	currentPage = 1;

	id = ++idCounter;

	number = number;
	Screen = makeObservableService( Screen );
	Scroll = Scroll;

	/**
	 * Depending on the screen size, we want to only show a certain number of
	 * games. This will trim the last few games off if it can't fit within the
	 * rows completely.
	 */
	get processedGames()
	{
		const truncateToFit = this.truncateToFit;
		const breakpoint = this.Screen.breakpoint;
		const games = this.games;

		if ( !truncateToFit ) {
			return games;
		}

		let rowSize: number;
		if ( breakpoint === 'sm' ) {
			rowSize = RowSizeSm;
		}
		else if ( breakpoint === 'md' ) {
			rowSize = RowSizeMd;
		}
		else if ( breakpoint === 'lg' ) {
			rowSize = RowSizeLg;
		}
		else {
			rowSize = games.length;
		}

		let chunkSize = Math.max( 1, Math.floor( games.length / rowSize ) ) * rowSize;
		return games.slice( 0, chunkSize );
	}
}
