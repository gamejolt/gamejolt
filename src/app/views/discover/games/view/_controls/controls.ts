import View from '!view!./controls.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppGamePlaylistAddToWidget } from '../../../../../components/game-playlist/add-to-widget/add-to-widget';
import { AppGameFollowWidget } from '../../../../../components/game/follow-widget/follow-widget';
import { AppPageHeaderControls } from '../../../../../components/page-header/controls/controls';
import { RouteStore, RouteStoreModule } from '../view.store';

@View
@Component({
	components: {
		AppPageHeaderControls,
		AppGameFollowWidget,
		AppGamePlaylistAddToWidget,
	},
})
export class AppDiscoverGamesViewControls extends Vue {
	@RouteStoreModule.State
	game!: RouteStore['game'];
}
