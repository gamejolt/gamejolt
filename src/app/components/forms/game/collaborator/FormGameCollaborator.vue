<script lang="ts" setup>
import { toRef } from 'vue';
import {
	$inviteCollaborator,
	CollaboratorModel,
	CollaboratorRole,
} from '../../../../../_common/collaborator/collaborator.model';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControlPrefix from '../../../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import { GameModel } from '../../../../../_common/game/game.model';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';

type Props = {
	game: GameModel;
	model?: CollaboratorModel;
};

const props = defineProps<Props>();
const { game } = props;

const CollaboratorRoleEqualCollaborator = CollaboratorRole.EqualCollaborator;
const CollaboratorRoleCommunityManager = CollaboratorRole.CommunityManager;

const form: FormController<CollaboratorModel> = createForm({
	model: toRef(props, 'model'),
	modelClass: CollaboratorModel,
	modelSaveHandler: $inviteCollaborator,
	resetOnSubmit: true,
	onInit() {
		form.formModel.resource = 'Game' as any;
		form.formModel.resource_id = game.id;

		if (props.model && props.model.user) {
			form.formModel.username = props.model.user.username;
		}
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
							url: `/web/dash/developer/games/collaborators/check-field-availability`,
							initVal: undefined,
						}),
					]"
					validate-on-blur
					focus
				/>
			</AppFormControlPrefix>

			<AppFormControlErrors :label="$gettext('username')">
				<AppFormControlError
					when="availability"
					:message="$gettext(`This user does not exist.`)"
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
						They will be able to access and modify everything for the game. They won't
						be able to add other collaborators.
					</AppTranslate>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="CollaboratorRoleCommunityManager" />
					<AppTranslate>Community Manager</AppTranslate>
					&mdash;
					<AppTranslate class="help-inline">
						They will be able to modify the game description, details, maturity, and
						media, as well as post devlogs. They won't be able to modify packages, game
						API, key groups, sales, or access analytics.
					</AppTranslate>
				</label>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton v-if="!!form.formModel.role">
			<AppTranslate v-if="form.method === 'add'">Invite</AppTranslate>
			<AppTranslate v-else>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
