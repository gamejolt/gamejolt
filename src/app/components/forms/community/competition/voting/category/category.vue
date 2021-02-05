<script lang="ts" src="./category"></script>

<template>
	<app-form name="communityCompetitionVotingCategoryForm">
		<app-form-group name="name" :label="$gettext(`Category Name`)">
			<app-form-control
				:rules="{
					max: 50,
					availability: {
						url: nameAvailabilityUrl,
					},
				}"
				:validate-on="['blur']"
				:placeholder="$gettext(`Graphics, Sound, etc...`)"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="description" :label="$gettext(`Category Description`)" optional>
			<app-form-control-textarea :rules="{ max: 250 }" />
			<app-form-control-errors />

			<p class="help-block">
				<translate>
					Often a description isn't needed. We suggest filling it in only for
					clarification if the name isn't guidance enough.
				</translate>
			</p>
		</app-form-group>

		<app-form-button show-when-valid>
			<translate>Save Category</translate>
		</app-form-button>
	</app-form>
</template>
