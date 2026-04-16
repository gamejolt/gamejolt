<script lang="ts" setup>
import { Api } from '~common/api/api.service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlToggle from '~common/form-vue/controls/AppFormControlToggle.vue';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';

type FormModel = {
	removeComments: boolean;
};

type Props = {
	user: UserModel;
};
const { user } = defineProps<Props>();

const emit = defineEmits<{
	submit: [];
}>();

const form: FormController<FormModel> = createForm<FormModel>({
	onSubmit() {
		const data = {
			username: user.username,
			removeComments: !!form.formModel.removeComments,
		};

		return Api.sendRequest('/web/dash/blocks/add', data);
	},
	onSubmitSuccess() {
		emit('submit');
	},
});
</script>

<template>
	<AppForm :controller="form">
		<div>
			<p>
				<span>
					{{ $gettext(`Are you sure you want to block`) }}
					{{ ' ' }}
					<b>@{{ user.username }}</b>
					?
				</span>
			</p>

			<p>
				{{
					$gettext(
						`They won't be able to follow you, send you a friend request, or reply to your posts and comments.`
					)
				}}
			</p>

			<p>
				<AppLinkHelp page="blocking-users" class="link-help">
					{{ $gettext(`Learn more about what happens when you block a user`) }}
				</AppLinkHelp>
			</p>
		</div>

		<br />

		<AppFormGroup
			name="removeComments"
			:label="$gettext(`Remove the user's comments from your profile and posts?`)"
		>
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<p class="help-block">
				{{
					$gettext(
						`All of their shouts on your profile and comments on your posts will be removed.`
					)
				}}
			</p>
		</AppFormGroup>

		<AppFormButton>
			{{ $gettext(`Block User`) }}
		</AppFormButton>
	</AppForm>
</template>
