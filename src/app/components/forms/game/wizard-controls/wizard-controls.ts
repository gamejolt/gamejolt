import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { findVueParent } from '../../../../../utils/vue';
import AppFormButton from '../../../../../_common/form-vue/button/button.vue';
import AppFormTS from '../../../../../_common/form-vue/form';
import AppForm from '../../../../../_common/form-vue/form.vue';
import { RouteStore, RouteStoreName } from '../../../../views/dashboard/games/manage/manage.store';

@Component({
	components: {
		AppFormButton,
	},
})
export default class AppDashGameWizardControls extends Vue {
	@Prop(Boolean) disabled?: boolean;

	// The manage route store may not be loaded in if we're in the "add" form.
	// We have to do all this a bit custom so that we don't expect the module to
	// exist.
	@State(RouteStoreName) manageRoute?: RouteStore;

	form?: AppFormTS;

	created() {
		this.form = findVueParent(this, AppForm) as AppFormTS;
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

	async next(_e: Event, formResult?: boolean) {
		if (!this.canProceed || formResult === false) {
			return;
		}

		if (this.manageRoute) {
			// Sadly we can't attach directly to this since manageRoute may not
			// exist.
			this.$store.dispatch(`${RouteStoreName}/wizardNext`);
		}
	}
}
