import { validateGaTrackingId } from '../../../../../_common/form-vue/validators';
<template>
	<app-form :controller="form">
		<app-form-group name="title" :label="$gettext(`Page Title`)" :optional="true">
			<div class="help-block" v-if="!formModel.game_id">
				<translate>
					You can override the default title for your site. This will show in search
					engines, and in the tab bar of browsers. By default it's your display name.
				</translate>
			</div>
			<div class="help-block" v-else>
				<translate>
					You can override the default title for your site. This will show in search
					engines, and in the tab bar of browsers. By default it's the title of your game.
				</translate>
			</div>

			<app-form-control :validators="[validateMaxLength(100)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="description" :label="$gettext(`Description`)" :optional="true">
			<div class="help-block">
				<translate>
					Search engines show this as the description under the page title in search
					results.
				</translate>
			</div>
			<app-form-control-textarea rows="3" :validators="[validateMaxLength(250)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="ga_tracking_id"
			:label="$gettext(`dash.games.settings.ga_tracking_id_label`)"
			:optional="true"
		>
			<app-form-control
				:validators="[validateMaxLength(30), validateGaTrackingId()]"
				:placeholder="$gettext(`dash.games.settings.ga_tracking_id_placeholder`)"
			/>

			<app-form-control-errors
				:label="$gettext(`dash.games.settings.ga_tracking_id_error_label`)"
			/>

			<div class="help-block">
				<p>
					<translate>
						Use Google Analytics to track a multitude of stats and get tons of
						information about your site. Just enter your Google Analytics tracking ID
						here and we'll start sending data over there right away.
					</translate>
				</p>
				<p>
					<app-link-external
						class="link-help"
						href="https://support.google.com/analytics/answer/1008080"
					>
						<translate>How do I get my tracking ID?</translate>
					</app-link-external>
				</p>
			</div>
		</app-form-group>

		<app-form-button>
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./settings"></script>
