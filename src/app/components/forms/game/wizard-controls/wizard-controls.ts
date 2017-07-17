import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./wizard-controls.html';

import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { findVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import { AppFormButton } from '../../../../../lib/gj-lib-client/components/form-vue/button/button';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

import {
	RouteAction,
	RouteStore,
	RouteState,
} from '../../../../views/dashboard/games/manage/manage.state';

@View
@Component({
	components: {
		AppFormButton,
		AppJolticon,
	},
})
export class AppDashGameWizardControls extends Vue {
	@Prop(Boolean) disabled?: boolean;

	@RouteState isWizard: RouteStore['isWizard'];
	@RouteAction wizardNext: RouteStore['wizardNext'];

	form?: AppForm;

	created() {
		this.form = findVueParent(this, AppForm);
	}

	get inForm() {
		return !!this.form;
	}

	get canProceed() {
		return !this.form || !this.form.hasErrors || this.disabled;
	}

	async next() {
		if (!this.canProceed) {
			return;
		}

		if (this.form) {
			const result = await this.form.submit();
			if (!result) {
				return;
			}
		}
		this.wizardNext();
	}
}
