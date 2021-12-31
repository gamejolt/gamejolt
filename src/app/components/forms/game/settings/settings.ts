import { Options } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { validateGaTrackingId } from '../../../../../_common/form-vue/validators';
import { Game } from '../../../../../_common/game/game.model';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';

@Options({
	components: {
		AppFormControlToggle,
		AppDashGameWizardControls,
	},
})
export default class FormGameSettings extends BaseForm<Game> implements FormOnLoad {
	modelClass = Game;
	saveMethod = '$saveSettings' as const;

	hasPackagesForSale = false;
	hasAdultContent = false;

	readonly validateGaTrackingId = validateGaTrackingId;

	get loadUrl() {
		return `/web/dash/developer/games/settings/save/${this.model!.id}`;
	}

	onLoad(payload: any) {
		this.hasPackagesForSale = payload.hasPackagesForSale;
		this.hasAdultContent = payload.hasAdultContent;
	}
}
