<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import {
	Collaborator,
	CollaboratorRole,
} from '../../../../../_common/collaborator/collaborator.model';
import AppFormControlPrefix from '../../../../../_common/form-vue/AppFormControlPrefix.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';

class Wrapper extends BaseForm<Collaborator> {}

@Options({
	components: {
		AppFormControlPrefix,
	},
})
export default class FormGameCollaborator extends mixins(Wrapper) {
	modelClass = Collaborator;
	saveMethod = '$invite' as const;

	@Prop(Object)
	game!: Game;

	readonly Collaborator = Collaborator;
	readonly CollaboratorRoleEqualCollaborator = CollaboratorRole.EqualCollaborator;
	readonly CollaboratorRoleCommunityManager = CollaboratorRole.CommunityManager;

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('resource', 'Game');
		this.setField('resource_id', this.game.id);

		if (this.model && this.model.user) {
			this.setField('username', this.model.user.username);
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

		<AppFormButton v-if="!!formModel.role">
			<AppTranslate v-if="method === 'add'">Invite</AppTranslate>
			<AppTranslate v-else>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
