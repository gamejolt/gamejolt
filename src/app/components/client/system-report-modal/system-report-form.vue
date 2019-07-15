<template>
	<app-form name="systemReportForm">
		<app-form-group name="issue_tracker_url" optional :label="$gettext('Issue Tracker Link')">
			<p class="help-block">
				<translate>
					Paste the link to your ticket here. It's optional, but without it we can't get back to you
					if we need more info to solve it.
				</translate>
				<span class="emoji emoji-huh" />
			</p>

			<app-form-control
				type="text"
				placeholder="https://github.com/gamejolt/issue-tracker/issues/1313"
				:rules="{
					max: 255,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

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
