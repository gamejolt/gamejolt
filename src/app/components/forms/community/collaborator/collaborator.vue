<template>
	<app-form name="collaboratorForm">
		<app-form-group name="username" :label="$gettext(`Username`)" v-if="method === 'add'">
			<app-form-control
				:rules="{
					max: 100,
					availability: {
						url: `/web/dash/communities/collaborators/check-field-availability`,
						initVal: undefined,
					},
				}"
				:validate-on="['blur']"
				v-app-focus-when
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
						They will be able to access and modify everything for the community. They won't be able
						to add other collaborators.
					</translate>
				</label>
			</div>
			<div class="radio">
				<label>
					<app-form-control-radio :value="Collaborator.ROLE_MODERATOR" />
					<translate>Moderator</translate>
					&mdash;
					<translate class="help-inline">
						They will be able to feature community posts; as well as ejecting them from the
						community.
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

<script lang="ts" src="./collaborator"></script>
