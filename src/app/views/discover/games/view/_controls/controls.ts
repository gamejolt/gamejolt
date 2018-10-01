import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./controls.html';

import { AppGameFollowWidget } from '../../../../../components/game/follow-widget/follow-widget';
import { AppGamePlaylistAddToWidget } from '../../../../../components/game-playlist/add-to-widget/add-to-widget';
import { RouteState, RouteStore } from '../view.store';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';

@View
@Component({
	components: {
		AppGameFollowWidget,
		AppGamePlaylistAddToWidget,
	},
})
export class AppDiscoverGamesViewControls extends Vue {
	@RouteState game: RouteStore['game'];

	readonly Screen = Screen;
}
