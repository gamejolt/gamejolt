import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./game.html?style=./game.styl';

import {
	BaseForm,
	FormOnInit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppFormLoader } from '../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
		AppFormLoader,
		AppFormControlToggle,
		AppExpand,
	},
	directives: {
		AppTooltip,
	},
})
export class FormGame extends BaseForm<Game> implements FormOnInit {
	@Prop(Boolean) isWizard?: boolean;

	@State app: Store['app'];

	// We need to reset all the "is published", "has builds" stuff.
	modelClass = Game;
	resetOnSubmit = true;

	acceptedRules = false;
	account: any = null;
	categories: any = null;
	engines: any = null;

	get loadUrl() {
		let url = '/web/dash/developer/games/save';
		if (this.method === 'edit') {
			url += '/' + this.model!.id;
		}
		return url;
	}

	get stage() {
		if (!this.acceptedRules) {
			return 'rules';
		} else if (this.formModel.development_status === undefined) {
			return 'dev-status';
		}
		return 'details';
	}

	get gameUrl() {
		return (
			'gamejolt.com/games' +
			'/<b>' +
			(this.formModel.path ? this.formModel.path.toLowerCase() : '_') +
			'</b>' +
			'/' +
			(this.model ? this.model.id : 'id')
		);
	}

	get siteUrl() {
		return (
			this.app.user!.username.toLowerCase() +
			'.gamejolt.io' +
			'/<b>' +
			(this.formModel.path ? this.formModel.path.toLowerCase() : '_') +
			'</b>'
		);
	}

	onInit() {
		this.acceptedRules = this.method !== 'add';

		if (this.method === 'add') {
			this.formModel.referrals_enabled = true;
		}
	}

	onLoaded(payload: any) {
		this.account = payload.account;
		this.categories = payload.categories;
		this.engines = payload.engines;
	}

	acceptRules() {
		this.acceptedRules = true;
		Scroll.to(0, { animate: false });
	}
}

// GameFormFactory.$inject = [ 'Form', 'App' ];
// export function GameFormFactory(
// 	Form: any,
// 	App: any,
// )
// {
// 	const form = new Form( {
// 		model: 'Game',
// 		template: require( './game.html' ),

// 		// We need this to reset all the "is published", "has builds" stuff.
// 		resetOnSubmit: true,
// 	} );

// 	form.scope.isWizard = '<';

// 	form.onInit = function( scope: any )
// 	{
// 		scope.App = App;

// 	};

// 	return form;
// }
