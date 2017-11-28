import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./controls.html';
import { State } from 'vuex-class';

import { AppGameFollowWidget } from '../../../../../components/game/follow-widget/follow-widget';
import { AppGamePlaylistAddToWidget } from '../../../../../components/game-playlist/add-to-widget/add-to-widget';
import { RouteState, RouteStore } from '../view.store';
import { Store } from '../../../../../store/index';

@View
@Component({
	components: {
		AppGameFollowWidget,
		AppGamePlaylistAddToWidget,
	},
})
export class AppDiscoverGamesViewControls extends Vue {
	@State app: Store['app'];

	@RouteState game: RouteStore['game'];
}
