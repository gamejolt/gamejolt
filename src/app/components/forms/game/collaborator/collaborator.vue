<script lang="ts" src="./collaborator"></script>

<template>
	<app-form name="collaboratorForm">
		<app-form-group v-if="method === 'add'" name="username" :label="$gettext(`Username`)">
			<app-form-control-prefixed-input
				v-app-focus-when
				prefix="@"
				:rules="{
					max: 100,
					availability: {
						url: `/web/dash/developer/games/collaborators/check-field-availability`,
						initVal: undefined,
					},
				}"
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
