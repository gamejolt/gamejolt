<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import {
	Collaborator,
	CollaboratorRole,
} from '../../../../../_common/collaborator/collaborator.model';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlPrefix from '../../../../../_common/form-vue/AppFormControlPrefix.vue';
import { vAppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<Collaborator> {}

@Options({
	components: {
		AppFormControlPrefix,
	},
	directives: {
		AppFocusWhen: vAppFocusWhen,
	},
})
export default class FormCommunityCollaborator extends mixins(Wrapper) {
	modelClass = Collaborator;
	saveMethod = '$invite' as const;

	@Prop({ type: Object, required: true }) community!: Community;

	readonly Collaborator = Collaborator;
	readonly CollaboratorRoleEqualCollaborator = CollaboratorRole.EqualCollaborator;
	readonly CollaboratorRoleModerator = CollaboratorRole.Moderator;
	readonly CollaboratorRoleJamOrganizer = CollaboratorRole.JamOrganizer;

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('resource', 'Community');
		this.setField('resource_id', this.community.id);

		if (this.model) {
			this.setField('username', this.model.user!.username);
		}
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup v-if="method === 'add'" name="username" :label="$gettext(`Username`)">
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
					<AppFormControlRadio :value="CollaboratorRoleEqualCollaborator" />
					<AppTranslate>Full Collaborator</AppTranslate>
					&mdash;
					<AppTranslate class="help-inline">
						They will be able to access and modify everything for the community. They
						won't be able to add other collaborators.
					</AppTranslate>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="CollaboratorRoleJamOrganizer" />
					<AppTranslate>Jam Organizer</AppTranslate>
					&mdash;
					<AppTranslate class="help-inline">
						They will be able to organize jams of this community, and edit properties of
						jam channels. They also have the same abilities as Moderators.
					</AppTranslate>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="CollaboratorRoleModerator" />
					<AppTranslate>Moderator</AppTranslate>
					&mdash;
					<AppTranslate class="help-inline">
						They will be able to feature community posts, move them between channels and
						eject them from the community.
					</AppTranslate>
				</label>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton v-if="!!formModel.role" show-when-valid>
			<AppTranslate v-if="method === 'add'">Invite</AppTranslate>
			<AppTranslate v-else>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
