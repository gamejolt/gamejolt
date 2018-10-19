import View from '!view!./description.html';
import { Component } from 'vue-property-decorator';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { FormGameDescription } from '../../../../../../components/forms/game/description/description';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageGameDescription',
	components: {
		FormGameDescription,
	},
})
export default class RouteDashGamesManageGameDescription extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Description for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	onSaved() {
		Growls.success(
			this.$gettext(`Your game description has been saved.`),
			this.$gettext(`Description Saved`)
		);
		Scroll.to(0);
	}
}
