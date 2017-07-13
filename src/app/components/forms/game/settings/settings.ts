import { Component } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppFormLoader } from '../../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFormControlToggle } from '../../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { AppDashGameWizardControls } from '../wizard-controls/wizard-controls';

@View
@Component({
	components: {
		AppFormLoader,
		AppJolticon,
		AppFormControlToggle,
		AppDashGameWizardControls,
	},
})
export class FormGameSettings extends BaseForm<Game> {
	modelClass = Game;
	saveMethod: '$saveSettings' = '$saveSettings';

	hasPackagesForSale = false;

	onLoaded(payload: any) {
		this.hasPackagesForSale = payload.hasPackagesForSale;
	}
}
