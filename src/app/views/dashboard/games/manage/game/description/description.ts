import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./description.html';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../manage.state';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { FormGameDescription } from '../../../../../../components/forms/game/description/description';

@View
@Component({
	components: {
		FormGameDescription,
	},
})
export default class RouteDashGamesManageGameDescription extends Vue
{
	@RouteState game: RouteStore['game'];
	@RouteState isWizard: RouteStore['isWizard'];

	created()
	{
		Meta.title = this.$gettextInterpolate(
			'Edit Description for %{ game }',
			{ game: this.game.title },
		);
	}

	onSaved()
	{
		if ( this.isWizard ) {
			// this.wizard.goNext( this.game );
			return;
		}

		Growls.success(
			this.$gettext( `Your game description has been saved.` ),
			this.$gettext( `Description Saved` ),
		);
		Scroll.to( 0 );
	}
}
