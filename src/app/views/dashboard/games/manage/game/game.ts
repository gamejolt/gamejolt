import { Component } from 'vue-property-decorator';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/editable-overlay.vue';
import AppExpand from '../../../../../../_common/expand/expand.vue';
import { Game } from '../../../../../../_common/game/game.model';
import AppMediaItemCover from '../../../../../../_common/media-item/cover/cover.vue';
import AppNavTabList from '../../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent } from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
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
