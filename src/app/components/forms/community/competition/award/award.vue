<script lang="ts" src="./award"></script>

<template>
	<app-form name="communityCompetitionAwardForm">
		<app-form-group name="name" :label="$gettext(`Award Name`)">
			<app-form-control
				:rules="{
					max: 50,
					availability: {
						url: nameAvailabilityUrl,
					},
				}"
				:validate-on="['blur']"
				:placeholder="$gettext(`1st Place, Best Graphics, etc...`)"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="description" :label="$gettext(`Award Description`)" optional>
			<app-form-control-textarea :rules="{ max: 250 }" />
			<app-form-control-errors />

			<p class="help-block">
				<translate>
					Descriptions aren't required, but you may use them if the award name isn't
					descriptive enough.
				</translate>
			</p>
		</app-form-group>

		<app-form-button :icon="isAdding ? 'add' : 'edit'" show-when-valid>
			<translate>Save Award</translate>
		</app-form-button>
	</app-form>
</template>
