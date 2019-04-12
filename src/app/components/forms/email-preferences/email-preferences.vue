<template>
	<app-form name="emailPreferencesForm">
		<app-form-group name="email_address">
			<app-form-control
				type="email"
				:rules="{
					max: 200,
					availability: {
						url: '/web/dash/email-preferences/check-field-availability/email_address',
						initVal: model.email_address,
					},
				}"
				:validate-on="['blur']"
			/>
			<app-form-control-errors />
		</app-form-group>

		<hr />

		<div class="clearfix">
			<template v-if="!emailsDisabled">
				<app-button class="pull-right" trans @click.prevent="toggleEmails(false)">
					<translate>Turn off emails</translate>
				</app-button>
			</template>
			<template v-else>
				<div class="pull-left">
					<p>
						<app-jolticon icon="notice" notice />
						<translate>Emails are currently turned off.</translate>
					</p>
				</div>
				<app-button class="pull-right" primary solid @click.prevent="toggleEmails(true)">
					<translate>Turn on emails</translate>
				</app-button>
			</template>
		</div>

		<br />

		<app-loading-fade :is-loading="isTogglingEmails">
			<fieldset :disabled="emailsDisabled">
				<legend>
					<translate>Activity</translate>
				</legend>

				<p class="help-block">
					<translate>Let us know what kinds of activity you'd like to get emailed for.</translate>
				</p>

				<app-form-group name="notifications" hide-label optional>
					<div
						class="checkbox"
						v-for="notificationType of notificationTypes"
						:key="notificationType.key"
					>
						<label>
							<app-form-control-checkbox :value="notificationType.key" />

							{{ notificationType.label }}
						</label>
					</div>
				</app-form-group>
			</fieldset>

			<fieldset :disabled="emailsDisabled">
				<legend>
					<translate>Updates from Game Jolt</translate>
				</legend>

				<div class="form-horizontal">
					<app-form-group
						name="notify_gj_news"
						:label="$gettext(`News and product changes`)"
						label-class="col-sm-4"
						disabled
					>
						<div class="col-sm-8">
							<app-form-control-toggle :disabled="emailsDisabled" />
							<p class="help-block">
								<translate>Get emails about new features and changes to Game Jolt.</translate>
							</p>
						</div>
					</app-form-group>

					<app-form-group
						name="notify_gj_recommendations"
						:label="$gettext(`Suggestions and recommendations`)"
						label-class="col-sm-4"
					>
						<div class="col-sm-8">
							<app-form-control-toggle :disabled="emailsDisabled" />
							<p class="help-block">
								<translate>
									Get email recommendations about content on Game Jolt that we think you might like.
								</translate>
							</p>
						</div>
					</app-form-group>
				</div>
			</fieldset>
		</app-loading-fade>

		<div class="row">
			<div class="col-sm-8 col-sm-offset-4">
				<app-form-button>
					<translate>dash.email_prefs.submit_button</translate>
				</app-form-button>
			</div>
		</div>
	</app-form>
</template>

<script lang="ts" src="./email-preferences"></script>
