<script lang="ts">
import { ref } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { useForm } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import { useGameDashRouteController } from '../../../../views/dashboard/games/manage/manage.store';

@Options({
	components: {
		AppFormButton,
	},
})
export default class AppDashGameWizardControls extends Vue {
	@Prop(Boolean) disabled?: boolean;

	// Might not be available if we're in the add game route.
	gameDashStore = setup(() => ref(useGameDashRouteController()));
	form = setup(() => ref(useForm()));

	get isWizard() {
		return !this.gameDashStore || this.gameDashStore.isWizard;
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

		this.gameDashStore?.wizardNext();
	}
}
</script>

<template>
	<div>
		<div v-if="isWizard">
			<hr />

			<div class="pull-right">
				<AppFormButton v-if="inForm" :disabled="!canProceed" @after-submit="next">
					<AppTranslate>Save & Next</AppTranslate>
				</AppFormButton>
				<AppButton v-else :disabled="!canProceed" @click="next">
					<AppTranslate>Next Step</AppTranslate>
				</AppButton>
			</div>
		</div>
		<div v-else>
			<slot />
		</div>
	</div>
</template>
