import View from '!view!./controls.html?style=./controls.styl';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppGamePlaylistAddToWidget } from '../../../../../components/game-playlist/add-to-widget/add-to-widget';
import { AppGameFollowWidget } from '../../../../../components/game/follow-widget/follow-widget';
import { RouteState, RouteStore } from '../view.store';

@View
@Component({
	components: {
		AppGameFollowWidget,
		AppGamePlaylistAddToWidget,
	},
})
export class AppDiscoverGamesViewControls extends Vue {
	@RouteState
	game!: RouteStore['game'];

	readonly Screen = Screen;
}
