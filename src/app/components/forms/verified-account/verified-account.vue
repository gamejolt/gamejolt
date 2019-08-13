<template>
	<app-form name="verifiedAccountForm">
		<app-form-group name="application" :label="$gettext(`Application Text`)">
			<app-form-control-textarea :maxlength="maxChars" rows="2" :disabled="!canSubmit" />
			<app-form-control-errors />
			<div v-if="!existingApplication" class="help-block">
				Provide us with a short explanation as to why you think your account should be verified!
				<strong>English only!</strong>
				({{ charactersLeft }} characters left)
			</div>
		</app-form-group>
		<app-form-button v-if="!existingApplication" :disabled="!valid || !canSubmit">
			Submit
		</app-form-button>
		<div v-else class="help-block">
			Your application has been submitted and is being reviewed.
		</div>
	</app-form>
</template>

<script lang="ts" src="./verified-account"></script>
