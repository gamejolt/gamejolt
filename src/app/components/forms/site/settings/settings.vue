<template>
	<app-form name="settingsForm">
		<app-form-group name="title" :label="$gettext(`Page Title`)" :optional="true">
			<div class="help-block" v-if="!formModel.game_id">
				<translate>
					You can override the default title for your site. This will show in search engines, and in
					the tab bar of browsers. By default it's your display name.
				</translate>
			</div>
			<div class="help-block" v-else>
				<translate>
					You can override the default title for your site. This will show in search engines, and in
					the tab bar of browsers. By default it's the title of your game.
				</translate>
			</div>

			<app-form-control
				:rules="{
					max: 100,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="description" :label="$gettext(`Description`)" :optional="true">
			<div class="help-block">
				<translate>
					Search engines show this as the description under the page title in search results.
				</translate>
			</div>
			<app-form-control-textarea
				rows="3"
				:rules="{
					max: 250,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="ga_tracking_id"
			:label="$gettext(`dash.games.settings.ga_tracking_id_label`)"
			:optional="true"
		>
			<app-form-control
				:rules="{
					max: 30,
					pattern: 'gaTrackingId',
				}"
				:placeholder="$gettext(`dash.games.settings.ga_tracking_id_placeholder`)"
			/>

			<app-form-control-errors
				:label="$gettext(`dash.games.settings.ga_tracking_id_error_label`)"
			/>

			<div class="help-block">
				<p>
					<translate>
						Use Google Analytics to track a multitude of stats and get tons of information about
						your site. Just enter your Google Analytics tracking ID here and we'll start sending
						data over there right away.
					</translate>
				</p>
				<p>
					<external-link
						class="link-help"
						href="https://support.google.com/analytics/answer/1008080"
					>
						<translate>How do I get my tracking ID?</translate>
					</external-link>
				</p>
			</div>
		</app-form-group>

		<app-form-button>
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./settings"></script>
