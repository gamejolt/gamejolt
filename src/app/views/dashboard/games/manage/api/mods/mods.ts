import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageApiMods',
})
export default class RouteDashGamesManageApiMods extends BaseRouteComponent {
	@RouteStoreModule.State game!: RouteStore['game'];

	// This page is driven by this help page content.
	readonly content = require(`../../../../../../../lib/doc-game-api/v1.x/mods/index.md`);

	get routeTitle() {
		return this.game
			? this.$gettextInterpolate('Mod Support for %{ game }', {
					game: this.game.title,
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  })
			: null;
	}
}
