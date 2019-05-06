<template>
	<app-form name="settingsForm">
		<app-form-group
			name="ga_tracking_id"
			:label="$gettext(`dash.games.settings.ga_tracking_id_label`)"
			:optional="true"
		>
			<app-form-control
				type="text"
				:rules="{
					max: 30,
					pattern: 'gaTrackingId',
				}"
				:placeholder="$gettext(`dash.games.settings.ga_tracking_id_placeholder`)"
			/>

			<app-form-control-errors
				:label="$gettext(`dash.games.settings.ga_tracking_id_error_label`)"
			/>

			<div class="help-block" v-translate>
				<p>
					Use
					<a href="http://google.com/analytics" target="_blank" rel="nofollow noopener">
						Google Analytics
					</a>
					to track a multitude of stats and get tons of information about your game page. Just enter
					your Google Analytics tracking ID here and we'll start sending data over there right away.
				</p>

				<p><strong>Here's how to set get started:</strong></p>

				<ul>
					<li>
						Create (or log into an existing)
						<a href="http://www.google.com/analytics" target="_blank" rel="nofollow noopener">
							Google Analytics
						</a>
						account.
					</li>
					<li>
						Set up a new Property (go to the
						<em>Admin</em>
						tab and select
						<em>Create new property</em>
						from the dropdown menu under
						<em>Property</em>
						).
					</li>
					<li>
						Select
						<em>Website</em>
						and enter
						<strong>gamejolt.com</strong>
						as the URL.
					</li>
					<li>Select an Industry Category and a Reporting Time Zone.</li>
					<li>
						Click
						<em>Get Tracking ID</em>
						.
					</li>
					<li>Come back here and enter your Tracking ID.</li>
					<li>You're all set!</li>
				</ul>
			</div>
		</app-form-group>

		<app-form-group
			v-if="!hasPackagesForSale && !hasAdultContent"
			name="ads_enabled"
			:label="$gettext(`dash.games.settings.ads_label`)"
		>
			<app-form-control-toggle class="pull-right" />
			<div class="help-block">
				<p>
					<strong>
						<translate>Turning this off will remove all ads for this game.</translate>
					</strong>
				</p>
				<p>
					<translate>
						Only do this if you don't want to monetize your game, or if your game is subject to a
						license that doesn't allow monetization.
					</translate>
				</p>
			</div>
		</app-form-group>
		<div v-else class="form-group">
			<label class="control-label">
				<translate>dash.games.settings.ads_label</translate>
			</label>
			<div class="alert">
				<translate v-if="hasPackagesForSale">
					We don't show ads on Marketplace game pages (even for pay what you want games).
				</translate>
				<translate v-else-if="hasAdultContent">
					We don't show ads on adult games.
				</translate>
			</div>
		</div>

		<app-form-group name="comments_enabled" :label="$gettext(`dash.games.settings.comments_label`)">
			<app-form-control-toggle class="pull-right" />
			<div class="help-block">
				<p>
					<strong>
						<translate>
							Turning this off will disable comments for this game and hide any comments already on
							the page.
						</translate>
					</strong>
				</p>

				<p>
					<translate>
						The community will no longer be able to give you feedback via comments, but you may
						prefer this if your game contains sensitive or controversial material.
					</translate>
				</p>

				<p>
					<translate>
						This will never remove comments from your game page—merely hide them. If you allow
						comments again in the future, all previously hidden comments will be restored.
					</translate>
				</p>
			</div>
		</app-form-group>

		<app-form-group name="ratings_enabled" :label="$gettext('Allow ratings?')">
			<app-form-control-toggle class="pull-right" />

			<div class="help-block">
				<p>
					<strong>
						<translate>
							Turning this off will disable ratings for this game and hide any ratings already on
							the page.
						</translate>
					</strong>
				</p>
				<p>
					<translate>
						Your game's voltage will be calculated as if it had received no likes or dislikes. If
						you allow ratings in the future, the old ratings will be reapplied and your voltage will
						be recalculated.
					</translate>
				</p>
			</div>
		</app-form-group>

		<app-dash-game-wizard-controls>
			<app-form-button>
				<translate>dash.games.settings.save_button</translate>
			</app-form-button>
		</app-dash-game-wizard-controls>
	</app-form>
</template>

<script lang="ts" src="./settings"></script>
