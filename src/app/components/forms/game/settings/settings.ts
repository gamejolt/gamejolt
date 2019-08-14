import { Component } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';

@Component({
	components: {
		AppFormControlToggle,
		AppDashGameWizardControls,
	},
})
export default class FormGameSettings extends BaseForm<Game> implements FormOnLoad {
	modelClass = Game;
	saveMethod: '$saveSettings' = '$saveSettings';

	hasPackagesForSale = false;
	hasAdultContent = false;

	get loadUrl() {
		return `/web/dash/developer/games/settings/save/${this.model!.id}`;
	}

	onLoad(payload: any) {
		this.hasPackagesForSale = payload.hasPackagesForSale;
		this.hasAdultContent = payload.hasAdultContent;
	}
}
