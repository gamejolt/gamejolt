<script lang="ts" src="./category"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="name" :label="$gettext(`Category Name`)">
			<app-form-control
				:validators="[
					validateMaxLength(50),
					validateAvailability({
						url: nameAvailabilityUrl,
					}),
				]"
				:validate-on="['blur']"
				:placeholder="$gettext(`Graphics, Sound, etc...`)"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="description" :label="$gettext(`Category Description`)" optional>
			<app-form-control-textarea :validators="[validateMaxLength(250)]" />
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
