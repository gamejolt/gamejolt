import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./add.html';

import { RouteResolve } from '../../../../../lib/gj-lib-client/utils/router';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { FormGame } from '../../../../components/forms/game/game';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';

@View
@Component({
	components: {
		FormGame,
	},
})
export default class RouteDashGamesAdd extends Vue {
	@RouteResolve()
	routeResolve(this: undefined, _route: VueRouter.Route) {
		return User.touch();
	}

	routeInit() {
		Meta.title = this.$gettext('dash.games.add.page_title');
	}

	onSubmit(game: Game) {
		this.$router.push({
			name: 'dash.games.manage.game.description',
			params: { id: game.id + '' },
			query: { wizard: 'true' },
		});
	}
}
