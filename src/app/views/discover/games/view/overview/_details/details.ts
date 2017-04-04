import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./details.html';

import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppLazyPlaceholder } from '../../../../../../../lib/gj-lib-client/components/lazy/placeholder/placeholder';
import { date } from '../../../../../../../lib/gj-lib-client/vue/filters/date';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppLazyPlaceholder,
		AppJolticon,
	},
	filters: {
		date,
	},
})
export class AppDiscoverGamesViewOverviewDetails extends Vue
{
	@Prop() game: Game;

	date = date;
}
