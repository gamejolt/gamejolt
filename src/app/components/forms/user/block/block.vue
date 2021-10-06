<template>
	<app-form name="communityBlockForm">
		<app-form-group name="username">
			<app-form-control-prefixed-input
				prefix="@"
				type="text"
				:rules="{
					max: 100,
					availability: {
						url: `/web/dash/blocks/check-field-availability`,
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
