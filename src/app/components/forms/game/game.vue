<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options } from 'vue-property-decorator';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnLoad } from '../../../../_common/form-vue/form.service';
import { validateUrlPath } from '../../../../_common/form-vue/validators';
import { $saveGame, GameModel } from '../../../../_common/game/game.model';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppGameDevStageSelector from './dev-stage-selector/AppGameDevStageSelector.vue';
import AppDashGameWizardControls from './wizard-controls/AppDashGameWizardControls.vue';

class Wrapper extends BaseForm<GameModel> {}

@Options({
	components: {
		AppFormControlToggle,
		AppExpand,
		AppDashGameWizardControls,
		AppGameDevStageSelector,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class FormGame extends mixins(Wrapper) implements FormOnLoad {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	// We need to reset all the "is published", "has builds" stuff.
	modelClass = GameModel;
	modelSaveHandler = $saveGame;

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
	<AppForm :controller="form">
		<div v-if="stage === 'dev-status'">
			<p class="page-help">
				<AppTranslate>
					Choose the stage of development that your game is currently in. You are able to
					change your development stage at any point.
				</AppTranslate>
			</p>

			<AppGameDevStageSelector @select="selectStage" />
		</div>
		<div v-else-if="stage === 'details'">
			<fieldset>
				<AppFormGroup name="title" :label="$gettext(`Title`)">
					<AppFormControl
						type="text"
						:validators="[validateMaxLength(250)]"
						:disabled="!hasAllPerms"
					/>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="path" :label="$gettext(`URL Path`)">
					<AppFormControl
						type="text"
						:validators="[
							validateUrlPath(),
							validateMaxLength(50),
							validateAvailability({
								url: '/web/dash/developer/games/check-field-availability/path',
								initVal: model?.path,
							}),
						]"
						:validate-delay="500"
						:disabled="!hasAllPerms"
					/>

					<AppFormControlErrors />

					<div class="help-block">
						<div>
							<AppTranslate>
								Customize your game page URLs. Make them really pretty.
							</AppTranslate>
						</div>
						<div>
							<AppTranslate>Game Page URL</AppTranslate>
							<code>
								<span>gamejolt.com/</span>
								<b>{{ formModel.path?.toLowerCase() || '_' }}</b>
								<span>/{{ model?.id || 'id' }}</span>
							</code>
						</div>
					</div>
				</AppFormGroup>

				<AppFormGroup name="web_site" :label="$gettext(`Website`)" :optional="true">
					<AppFormControl
						type="url"
						:validators="[validateMaxLength(250)]"
						:disabled="!hasAllPerms"
					/>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup
					v-if="engines"
					name="creation_tool"
					:label="$gettext(`Engine/Language/Creation Tool`)"
				>
					<AppFormControlSelect :disabled="!hasBuildsPerms">
						<option value="">
							<AppTranslate>Select an engine/language/tool...</AppTranslate>
						</option>
						<option v-for="(label, key) of engines" :key="key" :value="key">
							{{ label }}
						</option>
					</AppFormControlSelect>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppExpand :when="formModel.creation_tool === 'other'">
					<AppFormGroup
						name="creation_tool_other"
						:label="$gettext(`Other Engine/Language/Tool`)"
						:optional="true"
					>
						<AppFormControl
							type="text"
							:validators="[validateMaxLength(200)]"
							:disabled="!hasBuildsPerms"
						/>

						<AppFormControlErrors />

						<p class="help-block">
							<AppTranslate>Which engine, language, or tool?</AppTranslate>
							{{ ' ' }}
							<span
								v-app-tooltip.touchable="
									$gettext(
										`This helps us create better filtering options around which tools people use.`
									)
								"
								class="text-help"
							>
								<AppTranslate
									translate-comment="When hovering over this, we show a tooltip with additional information"
								>
									Why?
								</AppTranslate>
							</span>
						</p>
					</AppFormGroup>
				</AppExpand>

				<template v-if="hasSalesPerms">
					<AppFormGroup
						name="referrals_enabled"
						:label="$gettext(`Add to partner system?`)"
					>
						<template #inline-control>
							<AppFormControlToggle />
						</template>

						<div class="help-block">
							<div>
								<AppTranslate>
									This will allow Game Jolt Partners to be able to download the
									game for free, and give them a 10% cut of sales they refer to
									your game.
								</AppTranslate>
								{{ ' ' }}
								<router-link
									:to="{ name: 'landing.partners' }"
									class="link-help"
									target="_blank"
								>
									<AppTranslate>What is a Game Jolt Partner?</AppTranslate>
								</router-link>
							</div>
							<br />

							<div>
								<em>
									<AppTranslate>
										Note: This will only be enabled for "paid" or "name your
										price" games.
									</AppTranslate>
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
									<AppTranslate>
										You must sign the new Distribution Agreement which covers
										the terms for the Partner Program before your games will
										become available in the Partner Program.
									</AppTranslate>
									{{ ' ' }}
									<router-link :to="{ name: 'dash.account.financials' }">
										<AppTranslate>
											Click here to view the new Distribution Agreement
										</AppTranslate>
									</router-link>
								</div>
							</div>
						</div>
					</AppFormGroup>
				</template>
			</fieldset>

			<AppDashGameWizardControls>
				<AppFormButton v-if="method === 'edit'">
					<AppTranslate>Save Details</AppTranslate>
				</AppFormButton>
			</AppDashGameWizardControls>
		</div>
	</AppForm>
</template>
