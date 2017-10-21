import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./description.html';

import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppFormControlMarkdown } from '../../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppDashGameWizardControls } from '../wizard-controls/wizard-controls';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';

type DescriptionFormModel = Game & {
	autotag?: string;
	autotag_skip?: boolean;
};

@View
@Component({
	components: {
		AppExpand,
		AppFormControlMarkdown,
		AppJolticon,
		AppDashGameWizardControls,
	},
})
export class FormGameDescription extends BaseForm<DescriptionFormModel> {
	modelClass = Game;
	saveMethod = '$saveDescription' as '$saveDescription';

	isFnafDetected = false;
	isDisabled = false;

	$refs: {
		form: AppForm;
	};

	@Watch('serverErrors')
	onServerErrors() {
		this.isFnafDetected = false;
		this.isDisabled = false;
		if (this.serverErrors['autotag-fnaf']) {
			// This will make it so they can't edit the form and force them to choose if they want to tag or not.
			this.isFnafDetected = true;
			this.isDisabled = true;
		}
	}

	addAutotag(tag: string) {
		this.setField('autotag', tag);
		this.$refs.form.submit();
	}

	skipAutotag() {
		this.setField('autotag_skip', true);
		this.$refs.form.submit();
	}
}
