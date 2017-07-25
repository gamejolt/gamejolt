import { Component } from 'vue-property-decorator';
import * as View from '!view!./game.html?style=./game.styl';

import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppDashGameWizardControls } from './wizard-controls/wizard-controls';
import { AppGameDevStageSelector } from './dev-stage-selector/dev-stage-selector';

@View
@Component({
	components: {
		AppJolticon,
		AppFormControlToggle,
		AppExpand,
		AppDashGameWizardControls,
		AppGameDevStageSelector,
	},
	directives: {
		AppTooltip,
	},
})
export class FormGame extends BaseForm<Game> implements FormOnInit, FormOnLoad {
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
			this.setField('referrals_enabled', true);

			// We don't want to warn on discarding of the add game form. Only
			// during edit.
			this.warnOnDiscard = false;
		}
	}

	onLoad(payload: any) {
		this.account = payload.account;
		this.categories = payload.categories;
		this.engines = payload.engines;
	}

	selectStage(stage: number) {
		this.setField('development_status', stage);
	}

	acceptRules() {
		this.acceptedRules = true;
		Scroll.to(0, { animate: false });
	}
}
