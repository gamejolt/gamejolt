import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./recommended.html';

import { RouteState, RouteStore } from '../../view.store';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppGameList } from '../../../../../../components/game/list/list';
import { AppGameGridPlaceholder } from '../../../../../../components/game/grid/placeholder/placeholder';
import { AppGameGrid } from '../../../../../../components/game/grid/grid';
import { AppGameListPlaceholder } from '../../../../../../components/game/list/placeholder/placeholder';

@View
@Component({
	components: {
		AppGameGridPlaceholder,
		AppGameGrid,
		AppGameListPlaceholder,
		AppGameList,
	},
})
export class AppDiscoverGamesViewOverviewRecommended extends Vue {
	@RouteState recommendedGames!: RouteStore['recommendedGames'];

	readonly Screen = Screen;
}
