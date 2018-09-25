import { Component } from 'vue-property-decorator';
import View from '!view!./add.html';

import { RouteState, RouteStore } from '../../../manage.store';
import { GamePackage } from '../../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { AppJolticon } from '../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGamePackage } from '../../../../../../../components/forms/game/package/package';
import { BaseRouteComponent } from '../../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGamePackagesAdd',
	components: {
		AppJolticon,
		FormGamePackage,
	},
})
export default class RouteDashGamesManageGamePackagesAdd extends BaseRouteComponent {
	@RouteState game!: RouteStore['game'];

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
