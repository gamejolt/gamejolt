<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import AppFormControlToggle from '../../form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { User } from '../../user/user.model';

interface FormModel {
	removeComments: boolean;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class AppBlockForm extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(Object)
	user!: User;

	onSubmit() {
		const data = {
			username: this.user.username,
			removeComments: !!this.formModel.removeComments,
		};

		return Api.sendRequest('/web/dash/blocks/add', data);
	}
}
</script>

<template>
	<AppForm :controller="form">
		<div>
			<p>
				<span v-translate="{ username: user.username }">
					Are you sure you want to block
					<b>@%{ username }</b>?
				</span>
			</p>

			<p>
				<AppTranslate>
					They won't be able to follow you, send you a friend request, or reply to your
					posts and comments.
				</AppTranslate>
			</p>

			<p>
				<AppLinkHelp page="blocking-users" class="link-help">
					<AppTranslate>Learn more about what happens when you block a user</AppTranslate>
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
				<AppTranslate>
					All of their shouts on your profile and comments on your posts will be removed.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Block User</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
