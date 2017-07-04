import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./add.html';

import { BeforeRouteEnter } from '../../../../../../../../lib/gj-lib-client/utils/router';
import { Meta } from '../../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../../manage.state';
import { GamePackage } from '../../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { AppJolticon } from '../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGamePackage } from '../../../../../../../components/forms/game/package/package';

@View
@Component({
	components: {
		AppJolticon,
		FormGamePackage,
	},
})
export default class RouteDashGamesManageGamePackagesAdd extends Vue {
	@RouteState game: RouteStore['game'];

	@BeforeRouteEnter()
	routeEnter(this: undefined) {}

	routed() {
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
