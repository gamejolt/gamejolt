import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./wizard-controls.html';

import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { findVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import { AppFormButton } from '../../../../../lib/gj-lib-client/components/form-vue/button/button';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { RouteStore, RouteStoreName } from '../../../../views/dashboard/games/manage/manage.store';

@View
@Component({
	components: {
		AppFormButton,
		AppJolticon,
	},
})
export class AppDashGameWizardControls extends Vue {
	@Prop(Boolean) disabled?: boolean;

	// The manage route store may not be loaded in if we're in the "add" form.
	// We have to do all this a bit custom so that we don't expect the module to
	// exist.
	@State(RouteStoreName) manageRoute?: RouteStore;

	form?: AppForm;

	created() {
		this.form = findVueParent(this, AppForm);
	}

	get isWizard() {
		return !this.manageRoute || this.manageRoute.isWizard;
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

		if (this.manageRoute) {
			// Sadly we can't attach directly to this since manageRoute may not
			// exist.
			this.$store.dispatch(`${RouteStoreName}/wizardNext`);
		}
	}
}
