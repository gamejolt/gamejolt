import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { Component } from 'vue-property-decorator';
import FormGameDescription from '../../../../../../components/forms/game/description/description.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageGameDescription',
	components: {
		FormGameDescription,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/developer/games/description'),
})
export default class RouteDashGamesManageGameDescription extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	tags: string[] = [];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Description for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.tags = $payload.tags || [];
	}

	onSaved() {
		Growls.success(
			this.$gettext(`Your game description has been saved.`),
			this.$gettext(`Description Saved`)
		);
		Scroll.to(0);
	}
}
