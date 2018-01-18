import { Component } from 'vue-property-decorator';
import View from '!view!./game.html';

import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { RouteState, RouteStore, RouteAction } from '../manage.store';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppExpand } from '../../../../../../lib/gj-lib-client/components/expand/expand';
import { AppManageGameNav } from './_nav/nav';
import { AppNavTabList } from '../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppMediaItemCover } from '../../../../../../_common/media-item/cover/cover';
import { AppMediaBar } from '../../../../../../lib/gj-lib-client/components/media-bar/media-bar';
import { BaseRouteComponent } from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGame',
	components: {
		AppExpand,
		AppManageGameNav,
		AppNavTabList,
		AppMediaItemCover,
		AppMediaBar,
	},
})
export default class RouteDashGamesManageGame extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];
	@RouteState media: RouteStore['media'];
	@RouteState canPublish: RouteStore['canPublish'];

	@RouteAction saveDraft: RouteStore['saveDraft'];

	readonly Game = Game;
	readonly Screen = Screen;
}
