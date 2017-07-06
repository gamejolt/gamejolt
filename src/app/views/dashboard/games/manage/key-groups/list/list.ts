import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html?style=./list.styl';

import { BeforeRouteEnter } from '../../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { KeyGroup } from '../../../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { GamePackage } from '../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../manage.state';
import { AppCardList } from '../../../../../../../lib/gj-lib-client/components/card/list/list';
import { AppCardListItem } from '../../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppProgressBar } from '../../../../../../../lib/gj-lib-client/components/progress/bar/bar';
import { AppCardListAdd } from '../../../../../../../lib/gj-lib-client/components/card/list/add/add';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { FormGameKeyGroup } from '../../../../../../components/forms/game/key-group/key-group';

@View
@Component({
	components: {
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		AppProgressBar,
		AppJolticon,
		FormGameKeyGroup,
	},
	filters: {
		number,
	},
})
export default class RouteDashGamesManageKeyGroupsList extends Vue {
	@RouteState game: RouteStore['game'];

	keyGroups: KeyGroup[] = [];
	packages: GamePackage[] = [];
	isAdding = false;

	KeyGroup = KeyGroup;

	@BeforeRouteEnter()
	routeEnter(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/key-groups/' + route.params.id
		);
	}

	routed() {
		this.keyGroups = KeyGroup.populate(this.$payload.keyGroups);
		this.packages = GamePackage.populate(this.$payload.packages);

		Meta.title = this.$gettextInterpolate('Manage Key Groups for %{ game }', {
			game: this.game.title,
		});
	}

	onKeyGroupAdded(keyGroup: KeyGroup) {
		this.$router.push({
			name: 'dash.games.manage.key-groups.edit',
			params: {
				keyGroupId: keyGroup.id + '',
			},
		});
	}
}
