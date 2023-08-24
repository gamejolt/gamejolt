<script lang="ts" setup>
import { PropType } from 'vue';
import { Api } from '../../../_common/api/api.service';
import AppForm, { createForm, FormController } from '../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import { GameBundleModel } from '../../../_common/game-bundle/game-bundle.model';
import { GameModel } from '../../../_common/game/game.model';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';

const props = defineProps({
	keyId: {
		type: String,
		required: true,
	},
	bundle: {
		type: Object as PropType<GameBundleModel>,
		default: undefined,
	},
	game: {
		type: Object as PropType<GameModel>,
		default: undefined,
	},
});

const emit = defineEmits({
	submit: () => true,
});

interface FormModel {
	email: string;
}

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onSubmit: () => {
		let url = '/claim/retrieve';
		if (props.bundle) {
			url += '/bundle/' + props.keyId;
		} else if (props.game) {
			url += '/game/' + props.keyId;
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
