import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppFormLoader } from '../../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFormControlToggle } from '../../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';

@View
@Component({
	components: {
		AppFormLoader,
		AppJolticon,
		AppFormControlToggle,
	},
})
export class FormGameSettings extends BaseForm<Game> {
	modelClass = Game;
	saveMethod: '$saveSettings' = '$saveSettings';

	@Prop([Boolean])
	isWizard?: boolean;

	hasPackagesForSale = false;

	onLoaded(payload: any) {
		this.hasPackagesForSale = payload.hasPackagesForSale;
	}
}
