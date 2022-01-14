<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Collaborator } from '../../../../../_common/collaborator/collaborator.model';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';

class Wrapper extends BaseForm<Collaborator> {}

@Options({
	directives: {
		AppFocusWhen,
	},
})
export default class FormGameCollaborator extends mixins(Wrapper) {
	modelClass = Collaborator;
	saveMethod = '$invite' as const;

	@Prop(Object)
	game!: Game;

	readonly Collaborator = Collaborator;

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
	<app-form :controller="form">
		<app-form-group v-if="method === 'add'" name="username" :label="$gettext(`Username`)">
			<app-form-control
				v-app-focus-when
				prefix="@"
				:validators="[
					validateMaxLength(100),
					validateAvailability({
						url: `/web/dash/developer/games/collaborators/check-field-availability`,
						initVal: undefined,
					}),
				]"
				:validate-on="['blur']"
			/>

			<app-form-control-errors :label="$gettext('username')">
				<app-form-control-error
					when="availability"
					:message="$gettext(`This user does not exist.`)"
				/>
			</app-form-control-errors>
		</app-form-group>

		<app-form-group name="role" :label="$gettext('Role')">
			<div class="radio">
				<label>
					<app-form-control-radio :value="Collaborator.ROLE_EQUAL_COLLABORATOR" />
					<translate>Full Collaborator</translate>
					&mdash;
					<translate class="help-inline">
						They will be able to access and modify everything for the game. They won't
						be able to add other collaborators.
					</translate>
				</label>
			</div>
			<div class="radio">
				<label>
					<app-form-control-radio :value="Collaborator.ROLE_COMMUNITY_MANAGER" />
					<translate>Community Manager</translate>
					&mdash;
					<translate class="help-inline">
						They will be able to modify the game description, details, maturity, and
						media, as well as post devlogs. They won't be able to modify packages, game
						API, key groups, sales, or access analytics.
					</translate>
				</label>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button v-if="!!formModel.role">
			<translate v-if="method === 'add'">Invite</translate>
			<translate v-else>Save</translate>
		</app-form-button>
	</app-form>
</template>
