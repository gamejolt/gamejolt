<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppFormControlPrefix from '../../../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { showInfoGrowl } from '../../../../../_common/growls/growls.service';

interface FormModel {
	username: string;
	removeComments: boolean;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlToggle,
		AppFormControlPrefix,
	},
})
export default class FormUserBlock
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitSuccess
{
	created() {
		this.form.resetOnSubmit = true;
	}

	onSubmit() {
		return Api.sendRequest(`/web/dash/blocks/add`, this.formModel);
	}

	onSubmitSuccess(response: any) {
		if (response.success) {
			if (this.formModel.removeComments) {
				showInfoGrowl({
					message: this.$gettextInterpolate(
						'You blocked %{ user }! It might take a few moments for their comments/shouts to disappear',
						{
							user: this.formModel.username,
						}
					),
				});
			} else {
				showInfoGrowl({
					message: this.$gettextInterpolate('You blocked %{ user }!', {
						user: this.formModel.username,
					}),
				});
			}
		}
	}
}
</script>

<template>
	<app-form :controller="form">
		<app-form-group name="username">
			<app-form-control-prefix prefix="@">
				<app-form-control
					:validators="[
						validateMaxLength(100),
						validateAvailability({
							url: `/web/dash/blocks/check-field-availability`,
						}),
					]"
					:validate-on="['blur']"
				/>
			</app-form-control-prefix>

			<app-form-control-errors :label="$gettext('username')">
				<app-form-control-error
					when="availability"
					:message="$gettext(`This user does not exist.`)"
				/>
			</app-form-control-errors>
		</app-form-group>

		<app-form-group
			name="removeComments"
			:label="$gettext(`Remove the user's comments from your profile and posts?`)"
		>
			<app-form-control-toggle class="pull-right" />
			<p class="help-block">
				<translate>
					All of their shouts on your profile and comments on your posts will be removed.
				</translate>
			</p>
		</app-form-group>

		<app-form-button>
			<translate>Block</translate>
		</app-form-button>
	</app-form>
</template>
