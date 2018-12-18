import View from '!view!./game.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Store } from '../../../store/index';
import { AppGameDevStageSelector } from './dev-stage-selector/dev-stage-selector';
import { AppDashGameWizardControls } from './wizard-controls/wizard-controls';

@View
@Component({
	components: {
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
	@State
	app!: Store['app'];

	// We need to reset all the "is published", "has builds" stuff.
	modelClass = Game;
	resetOnSubmit = true;

	account: any = null;
	categories: any = null;
	engines: any = null;

	get hasAllPerms() {
		// If we're currently adding the game - we automatically have permission for it.
		if (this.method === 'add') {
			return true;
		}

		return this.model && this.model.hasPerms('all');
	}

	get hasBuildsPerms() {
		// If we're currently adding the game - we automatically have permission for it.
		if (this.method === 'add') {
			return true;
		}

		return this.model && this.model.hasPerms('builds');
	}

	get hasSalesPerms() {
		// If we're currently adding the game - we automatically have permission for it.
		if (this.method === 'add') {
			return true;
		}

		return this.model && this.model.hasPerms('sales');
	}

	get loadUrl() {
		let url = '/web/dash/developer/games/save';
		if (this.method === 'edit') {
			url += '/' + this.model!.id;
		}
		return url;
	}

	get stage() {
		if (this.formModel.development_status === undefined) {
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
		const user = this.method === 'add' || !this.model ? this.app.user! : this.model.developer;
		return (
			user.username.toLowerCase() +
			'.gamejolt.io' +
			'/<b>' +
			(this.formModel.path ? this.formModel.path.toLowerCase() : '_') +
			'</b>'
		);
	}

	onInit() {
		if (this.method === 'add') {
			this.setField('referrals_enabled', true);

			// No need to reset on submit during game add. It causes a flicker.
			this.resetOnSubmit = false;
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
}
