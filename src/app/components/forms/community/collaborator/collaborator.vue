<script lang="ts" src="./collaborator"></script>

<template>
	<app-form name="collaboratorForm">
		<app-form-group v-if="method === 'add'" name="username" :label="$gettext(`Username`)">
			<app-form-control-prefixed-input
				prefix="@"
				:rules="{
					max: 100,
					availability: {
						url: `/web/dash/communities/collaborators/check-field-availability/${community.id}`,
						initVal: undefined,
					},
				}"
				:validate-on="['blur']"
			/>

			<app-form-control-errors :label="$gettext('username')">
				<app-form-control-error
					when="availability"
					:message="$gettext(`This user does not exist or is blocked.`)"
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
						They will be able to access and modify everything for the community. They
						won't be able to add other collaborators.
					</translate>
				</label>
			</div>
			<div class="radio">
				<label>
					<app-form-control-radio :value="Collaborator.ROLE_JAM_ORGANIZER" />
					<translate>Jam Organizer</translate>
					&mdash;
					<translate class="help-inline">
						They will be able to organize jams of this community, and edit properties of
						jam channels. They also have the same abilities as Moderators.
					</translate>
				</label>
			</div>
			<div class="radio">
				<label>
					<app-form-control-radio :value="Collaborator.ROLE_MODERATOR" />
					<translate>Moderator</translate>
					&mdash;
					<translate class="help-inline">
						They will be able to feature community posts, move them between channels and
						eject them from the community.
					</translate>
				</label>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button v-if="!!formModel.role" show-when-valid>
			<translate v-if="method === 'add'">Invite</translate>
			<translate v-else>Save</translate>
		</app-form-button>
	</app-form>
</template>
