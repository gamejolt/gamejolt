<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { useForm } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import { RouteStore, RouteStoreName } from '../../../../views/dashboard/games/manage/manage.store';

@Options({
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

	form = setup(() => useForm());

	get isWizard() {
		return !this.manageRoute || this.manageRoute.isWizard;
	}

	get inForm() {
		return !!this.form;
	}

	get canProceed() {
		return !this.form || this.form.valid || this.disabled;
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
</script>

<template>
	<div>
		<div v-if="isWizard">
			<hr />

			<div class="pull-right">
				<app-form-button v-if="inForm" :disabled="!canProceed" @after-submit="next">
					<translate>Save & Next</translate>
				</app-form-button>
				<app-button v-else :disabled="!canProceed" @click="next">
					<translate>Next Step</translate>
				</app-button>
			</div>
		</div>
		<div v-else>
			<slot />
		</div>
	</div>
</template>
