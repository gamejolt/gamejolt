<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';

import AppExpand from '../../../../_common/expand/AppExpand.vue';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlSelect from '../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import {
	validateAvailability,
	validateMaxLength,
	validateUrlPath,
} from '../../../../_common/form-vue/validators';
import { $saveGame, GameModel } from '../../../../_common/game/game.model';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppGameDevStageSelector from './dev-stage-selector/AppGameDevStageSelector.vue';
import AppDashGameWizardControls from './wizard-controls/AppDashGameWizardControls.vue';

type FormModel = GameModel;

type Props = {
	model?: GameModel;
};

const props = defineProps<Props>();

const emit = defineEmits<{
	submit: [model: GameModel];
}>();

const account = ref<any>(null);
const categories = ref<any>(null);
const engines = ref<any>(null);

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(props, 'model'),
	modelClass: GameModel,
	modelSaveHandler: $saveGame,
	loadUrl: computed(() => {
		let url = '/web/dash/developer/games/save';
		if (form.method === 'edit') {
			url += '/' + props.model!.id;
		}
		return url;
	}),
	onInit() {
		form.resetOnSubmit = true;

		if (form.method === 'add') {
			form.formModel.referrals_enabled = true;

			// No need to reset on submit during game add. It causes a flicker.
			form.resetOnSubmit = false;
		}
	},
	onLoad(payload: any) {
		account.value = payload.account;
		categories.value = payload.categories;
		engines.value = payload.engines;
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

const hasAllPerms = computed(() => {
	if (form.method === 'add') {
		return true;
	}
	return props.model?.hasPerms('all');
});

const hasBuildsPerms = computed(() => {
	if (form.method === 'add') {
		return true;
	}
	return props.model?.hasPerms('builds');
});

const hasSalesPerms = computed(() => {
	if (form.method === 'add') {
		return true;
	}
	return props.model?.hasPerms('sales');
});

const stage = computed(() => {
	if (form.formModel.development_status === undefined) {
		return 'dev-status';
	}
	return 'details';
});

function selectStage(s: number) {
	form.formModel.development_status = s;
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
								<b>{{ form.formModel.path?.toLowerCase() || '_' }}</b>
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

				<AppExpand :when="form.formModel.creation_tool === 'other'">
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
				<AppFormButton v-if="form.method === 'edit'">
					<AppTranslate>Save Details</AppTranslate>
				</AppFormButton>
			</AppDashGameWizardControls>
		</div>
	</AppForm>
</template>
