<template>
	<app-form :controller="form">
		<app-form-group name="username">
			<app-form-control
				prefix="@"
				:validators="[
					validateMaxLength(100),
					validateAvailability({
						url: `/web/dash/blocks/check-field-availability`,
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

		<app-form-group
			name="removeComments"
			:label="$gettext(`Remove the user's comments from your profile and posts?`)"
		>
			<app-form-control-toggle class="pull-right" />
			<p class="help-block">
				<translate>
					All of their shouts on your profile and comments on your posts will be removed.
				</translate>
			</p>
		</app-form-group>

		<app-form-button>
			<translate>Block</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./block"></script>
