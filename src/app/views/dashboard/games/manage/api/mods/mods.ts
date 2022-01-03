import { Options } from 'vue-property-decorator';
// This page is driven by this help page content.
import { html } from '../../../../../../../lib/doc-game-api/v1.x/mods/index.md';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiMods',
})
export default class RouteDashGamesManageApiMods extends BaseRouteComponent {
	@RouteStoreModule.State game!: RouteStore['game'];

	readonly content = html;

	get routeTitle() {
		return this.game
			? this.$gettextInterpolate('Mod Support for %{ game }', {
					game: this.game.title,
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  })
			: null;
	}
}
