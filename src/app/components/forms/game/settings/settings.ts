import { Component } from 'vue-property-decorator';
import View from '!view!./settings.html';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import {
	BaseForm,
	FormOnLoad,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFormControlToggle } from '../../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { AppDashGameWizardControls } from '../wizard-controls/wizard-controls';

@View
@Component({
	components: {
		AppJolticon,
		AppFormControlToggle,
		AppDashGameWizardControls,
	},
})
export class FormGameSettings extends BaseForm<Game> implements FormOnLoad {
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
