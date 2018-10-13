import View from '!view!./add.html';
import { Component } from 'vue-property-decorator';
import { GamePackage } from '../../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { BaseRouteComponent } from '../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { FormGamePackage } from '../../../../../../../components/forms/game/package/package';
import { RouteStore, RouteStoreModule } from '../../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageGamePackagesAdd',
	components: {
		FormGamePackage,
	},
})
export default class RouteDashGamesManageGamePackagesAdd extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Add Package for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	onPackageAdded(newPackage: GamePackage) {
		this.$router.push({
			name: 'dash.games.manage.game.packages.edit',
			params: { packageId: newPackage.id + '' },
		});
	}
}
