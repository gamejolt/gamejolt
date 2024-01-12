<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import {
	$inviteCollaborator,
	CollaboratorModel,
	CollaboratorRole,
} from '../../../../../_common/collaborator/collaborator.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppForm, {
	FormController,
	createForm,
	defineFormEmits,
	defineFormProps,
} from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControlPrefix from '../../../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '../../../../../_common/form-vue/controls/AppFormControlRadio.vue';
import {
	validateAvailability,
	validateMaxLength,
} from '../../../../../_common/form-vue/validators';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	...defineFormProps<CollaboratorModel>(),
});

const emit = defineEmits({
	...defineFormEmits<CollaboratorModel>(),
});

const { community, model } = toRefs(props);

const form: FormController<CollaboratorModel> = createForm({
	model,
	modelClass: CollaboratorModel,
	modelSaveHandler: $inviteCollaborator,
	resetOnSubmit: true,
	onInit() {
		form.formModel.resource = 'Community';
		form.formModel.resource_id = community.value.id;

		if (model?.value) {
			form.formModel.username = form.formModel.user!.username;
		}
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup v-if="form.method === 'add'" name="username" :label="$gettext(`Username`)">
			<AppFormControlPrefix prefix="@">
				<AppFormControl
					:validators="[
						validateMaxLength(100),
						validateAvailability({
							url: `/web/dash/communities/collaborators/check-field-availability/${community.id}`,
						}),
					]"
					validate-on-blur
				/>
			</AppFormControlPrefix>

			<AppFormControlErrors :label="$gettext('username')">
				<AppFormControlError
					when="availability"
					:message="$gettext(`This user does not exist or is blocked.`)"
				/>
			</AppFormControlErrors>
		</AppFormGroup>

		<AppFormGroup name="role" :label="$gettext('Role')">
			<div class="radio">
				<label>
					<AppFormControlRadio :value="CollaboratorRole.EqualCollaborator" />
					{{ $gettext(`Full Collaborator`) }}
					&mdash;
					<span class="help-inline">
						{{
							$gettext(
								`They will be able to access and modify everything for the community. They won't be able to add other collaborators.`
							)
						}}
					</span>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="CollaboratorRole.JamOrganizer" />
					{{ $gettext(`Jam Organizer`) }}
					&mdash;
					<span class="help-inline">
						{{
							$gettext(
								`They will be able to organize jams of this community, and edit properties of jam channels. They also have the same abilities as Moderators.`
							)
						}}
					</span>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="CollaboratorRole.Moderator" />
					{{ $gettext(`Moderator`) }}
					&mdash;
					<span class="help-inline">
						{{
							$gettext(
								`They will be able to feature community posts, move them between channels and eject them from the community.`
							)
						}}
					</span>
				</label>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton v-if="!!form.formModel.role" show-when-valid>
			<span v-if="form.method === 'add'">{{ $gettext(`Invite`) }}</span>
			<span v-else>{{ $gettext(`Save`) }}</span>
		</AppFormButton>
	</AppForm>
</template>
