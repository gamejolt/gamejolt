import AppEditableOverlay from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay.vue';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Component } from 'vue-property-decorator';
import AppMediaItemCover from '../../../../../../_common/media-item/cover/cover.vue';
import { GameHeaderModal } from '../../../../../components/game/header-modal/header-modal.service';
import { RouteStore, RouteStoreModule } from '../manage.store';
import AppManageGameMediaBar from './_media-bar/media-bar.vue';
import AppManageGameNav from './_nav/nav.vue';

@Component({
	name: 'RouteDashGamesManageGame',
	components: {
		AppExpand,
		AppManageGameNav,
		AppManageGameMediaBar,
		AppNavTabList,
		AppEditableOverlay,
		AppMediaItemCover,
	},
})
export default class RouteDashGamesManageGame extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	media!: RouteStore['media'];

	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	saveDraft!: RouteStore['saveDraft'];

	readonly Game = Game;
	readonly Screen = Screen;

	showEditHeader() {
		GameHeaderModal.show(this.game);
	}
}
