import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./maturity.html';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { BeforeRouteEnter } from '../../../../../../../lib/gj-lib-client/utils/router';
import { RouteState, RouteStore } from '../../manage.state';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppScrollAffix } from '../../../../../../../lib/gj-lib-client/components/scroll/affix/affix';
import { AppGameOgrs } from '../../../../../../components/game/ogrs/ogrs';
import { FormGameMaturity } from '../../../../../../components/forms/game/maturity/maturity';

@View
@Component({
	components: {
		AppScrollAffix,
		AppGameOgrs,
		FormGameMaturity,
	},
})
export default class RouteDashGamesManageGameMaturity extends Vue {
	@RouteState game: RouteStore['game'];
	@RouteState isWizard: RouteStore['isWizard'];

	current: Game = null as any;

	Screen = Screen;

	@BeforeRouteEnter()
	routeEnter(this: void) {}

	routed() {
		this.current = this.game;

		Meta.title = this.$gettextInterpolate(
			`Edit Maturity Rating for %{ game }`,
			{
				game: this.game.title,
			}
		);
	}

	onSaved() {
		if (this.isWizard) {
			// TODO
			// this.wizard.goNext(this.game);
			return;
		}

		Growls.success(
			this.$gettext(`dash.games.maturity.saved_growl`),
			this.$gettext(`dash.games.maturity.saved_growl_title`)
		);

		Scroll.to(0);
	}
}
