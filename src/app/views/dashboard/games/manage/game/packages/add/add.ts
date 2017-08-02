import { Component } from 'vue-property-decorator';
import * as View from '!view!./add.html';

import { Meta } from '../../../../../../../../lib/gj-lib-client/components/meta/meta-service';
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
	@RouteState game: RouteStore['game'];

	routeInit() {
		Meta.title = this.$gettextInterpolate('Add Package for %{ game }', {
			game: this.game.title,
		});
	}

	onPackageAdded(newPackage: GamePackage) {
		this.$router.push({
			name: 'dash.games.manage.game.packages.edit',
			params: { packageId: newPackage.id + '' },
		});
	}
}
