import AppFormControlToggle from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnLoad } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { Component } from 'vue-property-decorator';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';


@Component({
	components: {
		AppJolticon,
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
