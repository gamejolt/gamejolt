import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppGamePlaylistAddToWidget from '../../../../game-playlist/add-to-widget/add-to-widget.vue';
import AppGameFollowWidget from '../../../../game/follow-widget/follow-widget.vue';
import AppPageHeaderControls from '../../../../page-header/controls/controls.vue';
import { RouteStore, RouteStoreModule } from '../view.store';

@Component({
	components: {
		AppPageHeaderControls,
		AppGameFollowWidget,
		AppGamePlaylistAddToWidget,
	},
})
export default class AppDiscoverGamesViewControls extends Vue {
	@RouteStoreModule.State
	game!: RouteStore['game'];
}
