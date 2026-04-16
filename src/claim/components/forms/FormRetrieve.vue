<script lang="ts" setup>
import { Api } from '../../../_common/api/api.service';
import AppForm, { createForm, FormController } from '../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import { GameModel } from '../../../_common/game/game.model';
import { GameBundleModel } from '../../../_common/game-bundle/game-bundle.model';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';

type Props = {
	keyId: string;
	bundle?: GameBundleModel;
	game?: GameModel;
};
const { keyId, bundle, game } = defineProps<Props>();

const emit = defineEmits<{
	submit: [];
}>();

type FormModel = {
	email: string;
};

const form: FormController<FormModel> = createForm<FormModel>({
	warnOnDiscard: false,
	onSubmit: () => {
		let url = '/claim/retrieve';
		if (bundle) {
			url += '/bundle/' + keyId;
		} else if (game) {
			url += '/game/' + keyId;
		}

		return Api.sendRequest(url, form.formModel);
	},
	onSubmitSuccess: () => emit('submit'),
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="email" :label="$gettext('Email Address')">
			<AppFormControl type="email" validate-on-blur />

			<AppFormControlErrors>
				<AppFormControlError
					when="server"
					:message="
						$gettext(
							`That email address doesn't seem to be correct. Please check that you entered it correctly.`
						)
					"
				/>
			</AppFormControlErrors>
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Retrieve</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
