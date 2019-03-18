import AppFormButton from 'game-jolt-frontend-lib/components/form-vue/button/button.vue';
import AppForm from 'game-jolt-frontend-lib/components/form-vue/form';
import { findVueParent } from 'game-jolt-frontend-lib/utils/vue';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { RouteStore, RouteStoreName } from '../../../../views/dashboard/games/manage/manage.store';

@Component({
	components: {
		AppFormButton,
		AppJolticon,
	},
})
export default class AppDashGameWizardControls extends Vue {
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
