<script lang="ts" setup>
import { Api } from '~common/api/api.service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlError from '~common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormControlPrefix from '~common/form-vue/AppFormControlPrefix.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlToggle from '~common/form-vue/controls/AppFormControlToggle.vue';
import {
	validateAvailability,
	validateMaxLength,
} from '~common/form-vue/validators';
import { showInfoGrowl } from '~common/growls/growls.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type FormModel = {
	username: string;
	removeComments: boolean;
};

const emit = defineEmits<{
	submit: [];
}>();

const form: FormController<FormModel> = createForm({
	resetOnSubmit: true,
	onSubmit() {
		return Api.sendRequest(`/web/dash/blocks/add`, form.formModel);
	},
	onSubmitSuccess(response: any) {
		emit('submit');
		if (response.success) {
			if (form.formModel.removeComments) {
				showInfoGrowl({
					message: $gettext(
						'You blocked %{ user }! It might take a few moments for their comments/shouts to disappear',
						{
							user: form.formModel.username,
						}
					),
				});
			} else {
				showInfoGrowl({
					message: $gettext('You blocked %{ user }!', {
						user: form.formModel.username,
					}),
				});
			}
		}
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="username">
			<AppFormControlPrefix prefix="@">
				<AppFormControl
					:validators="[
						validateMaxLength(100),
						validateAvailability({
							url: `/web/dash/blocks/check-field-availability`,
						}),
					]"
					validate-on-blur
				/>
			</AppFormControlPrefix>

			<AppFormControlErrors :label="$gettext('username')">
				<AppFormControlError
					when="availability"
					:message="$gettext(`This user does not exist.`)"
				/>
			</AppFormControlErrors>
		</AppFormGroup>

		<AppFormGroup
			name="removeComments"
			:label="$gettext(`Remove the user's comments from your profile and posts?`)"
		>
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<p class="help-block">
				<AppTranslate>
					All of their shouts on your profile and comments on your posts will be removed.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Block</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
