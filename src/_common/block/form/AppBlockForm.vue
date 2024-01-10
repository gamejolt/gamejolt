<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { Api } from '../../api/api.service';
import AppForm, { FormController, createForm } from '../../form-vue/AppForm.vue';
import AppFormButton from '../../form-vue/AppFormButton.vue';
import AppFormGroup from '../../form-vue/AppFormGroup.vue';
import AppFormControlToggle from '../../form-vue/controls/AppFormControlToggle.vue';
import AppLinkHelp from '../../link/AppLinkHelp.vue';
import { $gettext } from '../../translate/translate.service';
import { UserModel } from '../../user/user.model';

interface BlockFormModel {
	removeComments: boolean;
}

const props = defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const { user } = toRefs(props);

const form: FormController<BlockFormModel> = createForm({
	onSubmit() {
		const data = {
			username: user.value.username,
			removeComments: !!form.formModel.removeComments,
		};

		return Api.sendRequest('/web/dash/blocks/add', data);
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
