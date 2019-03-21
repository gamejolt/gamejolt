<template>
	<app-form name="gameForm">
		<div v-if="stage === 'dev-status'">
			<p class="page-help">
				<translate>
					Choose the stage of development that your game is currently in. You are able to change
					your development stage at any point.
				</translate>
			</p>

			<app-game-dev-stage-selector @select="selectStage" />
		</div>
		<div v-else-if="stage === 'details'">
			<fieldset>
				<app-form-group name="title" :label="$gettext(`dash.games.form.title_label`)">
					<app-form-control
						type="text"
						:rules="{
							max: 250,
						}"
						:disabled="!hasAllPerms"
					/>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group name="path" :label="$gettext(`URL Path`)">
					<app-form-control
						type="text"
						data-vv-delay="500"
						:rules="{
							pattern: 'urlPath',
							max: 50,
							availability: {
								url: '/web/dash/developer/games/check-field-availability/path',
								initVal: method === 'edit' ? model.path : undefined,
							},
						}"
						:disabled="!hasAllPerms"
					/>

					<app-form-control-errors />

					<div class="help-block">
						<div>
							<translate>Customize your game page URLs. Make them really pretty.</translate>
						</div>
						<div>
							<translate>Game Page URL</translate>
							<code v-html="gameUrl"></code>
						</div>
						<div>
							<translate>Sites URL</translate>
							<code v-html="siteUrl"></code>
						</div>
					</div>
				</app-form-group>

				<app-form-group
					name="web_site"
					:label="$gettext(`dash.games.form.website_label`)"
					:optional="true"
				>
					<app-form-control
						type="url"
						:rules="{
							max: 250,
						}"
						:disabled="!hasAllPerms"
					/>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					v-if="engines"
					name="creation_tool"
					:label="$gettext(`dash.games.form.engine_label`)"
				>
					<app-form-control-select :disabled="!hasBuildsPerms">
						<option value="">
							<translate>dash.games.form.engine_placeholder</translate>
						</option>
						<option v-for="(label, key) of engines" :key="key" :value="key">
							{{ label }}
						</option>
					</app-form-control-select>
					<app-form-control-errors />
				</app-form-group>

				<app-expand :when="formModel.creation_tool === 'other'">
					<app-form-group
						name="creation_tool_other"
						:label="$gettext(`dash.games.form.engine_other_label`)"
						:optional="true"
					>
						<app-form-control
							type="text"
							:rules="{
								max: 200,
							}"
							:disabled="!hasBuildsPerms"
						/>

						<app-form-control-errors />

						<p class="help-block">
							<translate>dash.games.form.engine_other_help</translate>
							<span
								class="text-help"
								v-app-tooltip="$gettext(`dash.games.form.engine_other_why_tooltip`)"
							>
								<translate>dash.games.form.engine_other_why</translate>
							</span>
						</p>
					</app-form-group>
				</app-expand>

				<template v-if="hasSalesPerms">
					<app-form-group name="referrals_enabled" :label="$gettext(`Add to partner system?`)">
						<app-form-control-toggle class="pull-right" />

						<div class="help-block">
							<div>
								<translate>
									This will allow Game Jolt Partners to be able to download the game for free, and
									give them a 10% cut of sales they refer to your game.
								</translate>
								<router-link :to="{ name: 'landing.partners' }" class="link-help" target="_blank">
									<translate>What is a Game Jolt Partner?</translate>
								</router-link>
							</div>
							<br />

							<div>
								<em v-translate>
									<b>Note</b>
									: This will only be enabled for "paid" or "name your price" games.
								</em>
							</div>

							<!--
							We only show this message to devs that have signed v1 of the distribution agreement.
							That's because they've approved themselves to be part of the marketplace, but
							haven't yet signed the terms for partners.
						-->
							<div v-if="account && account.tos_signed_developer === 1">
								<br />
								<div class="alert alert-notice">
									<translate>
										You must sign the new Distribution Agreement which covers the terms for the
										Partner Program before your games will become available in the Partner Program.
									</translate>
									<router-link :to="{ name: 'dash.account.financials' }">
										<translate>Click here to view the new Distribution Agreement</translate>
									</router-link>
								</div>
							</div>
						</div>
					</app-form-group>
				</template>
			</fieldset>

			<app-dash-game-wizard-controls>
				<app-form-button v-if="method === 'edit'">
					<translate>Save Details</translate>
				</app-form-button>
			</app-dash-game-wizard-controls>
		</div>
	</app-form>
</template>

<script lang="ts" src="./game" />
