<script lang="ts" src="./award"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="name" :label="$gettext(`Award Name`)">
			<app-form-control
				:validators="[
					validateMaxLength(50),
					validateAvailability({
						url: nameAvailabilityUrl,
					}),
				]"
				:validate-on="['blur']"
				:placeholder="$gettext(`1st Place, Best Graphics, etc...`)"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="description" :label="$gettext(`Award Description`)" optional>
			<app-form-control-textarea :validators="[validateMaxLength(250)]" />
			<app-form-control-errors />

			<p class="help-block">
				<translate>
					Descriptions aren't required, but you may use them if the award name isn't
					descriptive enough.
				</translate>
			</p>
		</app-form-group>

		<app-form-button show-when-valid>
			<translate>Save Award</translate>
		</app-form-button>
	</app-form>
</template>
