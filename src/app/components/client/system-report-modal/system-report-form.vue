<template>
	<app-form name="systemReportForm">
		<app-form-group name="description" :label="$gettext('system_report.form.description_label')">
			<p class="help-block">
				<translate>system_report.form.description_help</translate>
			</p>
			<app-form-control-textarea maxlength="1000" rows="5" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-button :disabled="!valid">
			<translate>system_report.form.submit_button</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./system-report-form"></script>
