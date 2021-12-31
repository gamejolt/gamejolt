import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnLoad } from '../../../../_common/form-vue/form.service';
import { validateUrlPath } from '../../../../_common/form-vue/validators';
import { Game } from '../../../../_common/game/game.model';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../store/index';
import AppGameDevStageSelector from './dev-stage-selector/dev-stage-selector.vue';
import AppDashGameWizardControls from './wizard-controls/wizard-controls.vue';

@Options({
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
export default class FormGame extends BaseForm<Game> implements FormOnLoad {
	@State
	app!: Store['app'];

	// We need to reset all the "is published", "has builds" stuff.
	modelClass = Game;

	account: any = null;
	categories: any = null;
	engines: any = null;

	readonly validateUrlPath = validateUrlPath;

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
		this.form.resetOnSubmit = true;

		if (this.method === 'add') {
			this.setField('referrals_enabled', true);

			// No need to reset on submit during game add. It causes a flicker.
			this.form.resetOnSubmit = false;
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
