<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options } from 'vue-property-decorator';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnLoad } from '../../../../_common/form-vue/form.service';
import { validateUrlPath } from '../../../../_common/form-vue/validators';
import { Game } from '../../../../_common/game/game.model';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppGameDevStageSelector from './dev-stage-selector/dev-stage-selector.vue';
import AppDashGameWizardControls from './wizard-controls/wizard-controls.vue';

class Wrapper extends BaseForm<Game> {}

@Options({
	components: {
		AppFormControlToggle,
		AppExpand,
		AppDashGameWizardControls,
		AppGameDevStageSelector,
	},
	directives: {
		AppTooltip,
	},
})
export default class FormGame extends mixins(Wrapper) implements FormOnLoad {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	// We need to reset all the "is published", "has builds" stuff.
	modelClass = Game;

	account: any = null;
	categories: any = null;
	engines: any = null;

	readonly validateUrlPath = validateUrlPath;

	get hasAllPerms() {
		// If we're currently adding the game - we automatically have permission for it.
		if (this.method === 'add') {
			return true;
		}

		return this.model?.hasPerms('all');
	}

	get hasBuildsPerms() {
		// If we're currently adding the game - we automatically have permission for it.
		if (this.method === 'add') {
			return true;
		}

		return this.model?.hasPerms('builds');
	}

	get hasSalesPerms() {
		// If we're currently adding the game - we automatically have permission for it.
		if (this.method === 'add') {
			return true;
		}

		return this.model?.hasPerms('sales');
	}

	get loadUrl() {
		let url = '/web/dash/developer/games/save';
		if (this.method === 'edit') {
			url += '/' + this.model!.id;
		}
		return url;
	}

	get stage() {
		if (this.formModel.development_status === undefined) {
			return 'dev-status';
		}
		return 'details';
	}

	get gameUrl() {
		return (
			'gamejolt.com/games' +
			'/<b>' +
			(this.formModel.path ? this.formModel.path.toLowerCase() : '_') +
			'</b>' +
			'/' +
			(this.model ? this.model.id : 'id')
		);
	}

	get siteUrl() {
		const user = this.method === 'add' || !this.model ? this.app.user! : this.model.developer;
		return (
			user.username.toLowerCase() +
			'.gamejolt.io' +
			'/<b>' +
			(this.formModel.path ? this.formModel.path.toLowerCase() : '_') +
			'</b>'
		);
	}

	onInit() {
		this.form.resetOnSubmit = true;

		if (this.method === 'add') {
			this.setField('referrals_enabled', true);

			// No need to reset on submit during game add. It causes a flicker.
			this.form.resetOnSubmit = false;
		}
	}

	onLoad(payload: any) {
		this.account = payload.account;
		this.categories = payload.categories;
		this.engines = payload.engines;
	}

	selectStage(stage: number) {
		this.setField('development_status', stage);
	}
}
</script>

<template>
	<app-form :controller="form">
		<div v-if="stage === 'dev-status'">
			<p class="page-help">
				<translate>
					Choose the stage of development that your game is currently in. You are able to
					change your development stage at any point.
				</translate>
			</p>

			<app-game-dev-stage-selector @select="selectStage" />
		</div>
		<div v-else-if="stage === 'details'">
			<fieldset>
				<app-form-group name="title" :label="$gettext(`dash.games.form.title_label`)">
					<app-form-control
						type="text"
						:validators="[validateMaxLength(250)]"
						:disabled="!hasAllPerms"
					/>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group name="path" :label="$gettext(`URL Path`)">
					<app-form-control
						type="text"
						:validators="[
							validateUrlPath(),
							validateMaxLength(50),
							validateAvailability({
								url: '/web/dash/developer/games/check-field-availability/path',
								initVal: method === 'edit' ? model.path : undefined,
							}),
						]"
						data-vv-delay="500"
						:disabled="!hasAllPerms"
					/>

					<app-form-control-errors />

					<div class="help-block">
						<div>
							<translate>
								Customize your game page URLs. Make them really pretty.
							</translate>
						</div>
						<div>
							<translate>Game Page URL</translate>
							<code v-html="gameUrl" />
						</div>
						<div>
							<translate>Sites URL</translate>
							<code v-html="siteUrl" />
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
						:validators="[validateMaxLength(250)]"
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
							:validators="[validateMaxLength(200)]"
							:disabled="!hasBuildsPerms"
						/>

						<app-form-control-errors />

						<p class="help-block">
							<translate>dash.games.form.engine_other_help</translate>
							<span
								v-app-tooltip.touchable="
									$gettext(`dash.games.form.engine_other_why_tooltip`)
								"
								class="text-help"
							>
								<translate>dash.games.form.engine_other_why</translate>
							</span>
						</p>
					</app-form-group>
				</app-expand>

				<template v-if="hasSalesPerms">
					<app-form-group
						name="referrals_enabled"
						:label="$gettext(`Add to partner system?`)"
					>
						<app-form-control-toggle class="pull-right" />

						<div class="help-block">
							<div>
								<translate>
									This will allow Game Jolt Partners to be able to download the
									game for free, and give them a 10% cut of sales they refer to
									your game.
								</translate>
								<router-link
									:to="{ name: 'landing.partners' }"
									class="link-help"
									target="_blank"
								>
									<translate>What is a Game Jolt Partner?</translate>
								</router-link>
							</div>
							<br />

							<div>
								<em v-translate>
									<b>Note</b>
									: This will only be enabled for "paid" or "name your price"
									games.
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
										You must sign the new Distribution Agreement which covers
										the terms for the Partner Program before your games will
										become available in the Partner Program.
									</translate>
									<router-link :to="{ name: 'dash.account.financials' }">
										<translate>
											Click here to view the new Distribution Agreement
										</translate>
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
