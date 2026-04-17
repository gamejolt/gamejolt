<script lang="ts" setup>
import { toRef } from 'vue';

import AppDashGameWizardControls from '~app/components/forms/game/wizard-controls/AppDashGameWizardControls.vue';
import AppExpand from '~common/expand/AppExpand.vue';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '~common/form-vue/controls/AppFormControlRadio.vue';
import { $saveGameMaturity, GameModel } from '~common/game/game.model';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type MaturityField = {
	label?: string;
	description?: string;
};

type FormModel = GameModel;

type Props = {
	model?: GameModel;
};

const props = defineProps<Props>();

const emit = defineEmits<{
	changed: [game: GameModel];
	submit: [];
}>();

const age: MaturityField[] = [
	{},
	{ label: $gettext('All Ages') },
	{ label: $gettext('Teen Content') },
	{ label: $gettext('Mature Content') },
];

const cartoonViolence: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Mild'),
		description: $gettext('Depictions of cartoon-like characters in unsafe situations.'),
	},
	{
		label: $gettext('Moderate'),
		description: $gettext('Depictions of cartoon-like characters in aggressive conflict.'),
	},
	{
		label: $gettext('Intense'),
		description: $gettext('Graphic depictions of violence involving cartoon-like characters.'),
	},
];

const fantasyViolence: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Mild'),
		description: $gettext(
			'Depictions of characters in unsafe situations easily distinguishable from real life.'
		),
	},
	{
		label: $gettext('Moderate'),
		description: $gettext(
			'Depictions of characters in aggressive conflict easily distinguishable from real life.'
		),
	},
	{
		label: $gettext('Intense'),
		description: $gettext(
			'Graphic depictions of violence involving situations easily distinguishable from real life.'
		),
	},
];

const realisticViolence: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Mild'),
		description: $gettext('Mild depictions of realistic characters in unsafe situations.'),
	},
	{
		label: $gettext('Moderate'),
		description: $gettext('Depictions of realistic characters in aggressive conflict.'),
	},
	{
		label: $gettext('Intense'),
		description: $gettext('Graphic depictions of violence involving realistic characters.'),
	},
];

const bloodshed: MaturityField[] = [
	{ label: $gettext('None') },
	{ label: $gettext('Mild'), description: $gettext('Unrealistic depictions of bloodshed.') },
	{ label: $gettext('Moderate'), description: $gettext('Realistic depictions of bloodshed.') },
	{
		label: $gettext('Intense'),
		description: $gettext('Depictions of bloodshed and the mutilation of body parts.'),
	},
];

const sexualViolence: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Sexual Violence'),
		description: $gettext(
			'Depictions of or graphic references to rape or other violent sexual behavior.'
		),
	},
];

const alcohol: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Reference'),
		description: $gettext('References to or images of alcoholic beverages.'),
	},
	{ label: $gettext('Use'), description: $gettext('Use of alcoholic beverages.') },
];

const drugs: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Reference'),
		description: $gettext('References to or images of illicit drugs.'),
	},
	{ label: $gettext('Use'), description: $gettext('Use of illicit drugs.') },
];

const tobacco: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Reference'),
		description: $gettext('References to or images of tobacco products.'),
	},
	{ label: $gettext('Use'), description: $gettext('Use of tobacco products.') },
];

const nudity: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Brief Nudity'),
		description: $gettext('Brief depictions of nudity or artistic nudity.'),
	},
	{ label: $gettext('Nudity'), description: $gettext('Prolonged depictions of nudity.') },
];

const sexualThemes: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Suggestive'),
		description: $gettext('Provocative references or depictions of provocative behavior.'),
	},
	{
		label: $gettext('Moderate'),
		description: $gettext('Sexual references or depictions of sexual behavior.'),
	},
	{ label: $gettext('Graphic'), description: $gettext('Graphic depictions of sexual behavior.') },
];

const language: MaturityField[] = [
	{ label: $gettext('None') },
	{ label: $gettext('Mild'), description: $gettext('Mild or infrequent use of profanity.') },
	{ label: $gettext('Moderate'), description: $gettext('Moderate use of profanity.') },
	{ label: $gettext('Strong'), description: $gettext('Strong or frequent use of profanity.') },
];

const humor: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Comic Shenanigans'),
		description: $gettext('Depictions of or dialog including slapstick humor.'),
	},
	{
		label: $gettext('Moderate'),
		description: $gettext('Depictions of or dialog including vulgar humor; bathroom humor.'),
	},
	{
		label: $gettext('Strong'),
		description: $gettext('Depictions of or dialog including mature humor; sexual humor.'),
	},
];

const gambling: MaturityField[] = [
	{ label: $gettext('None') },
	{
		label: $gettext('Simulated'),
		description: $gettext('Players can gamble using "play" money.'),
	},
	{
		label: $gettext('Real Gambling'),
		description: $gettext('Players can gamble using real money.'),
	},
];

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(props, 'model'),
	modelClass: GameModel,
	modelSaveHandler: $saveGameMaturity,
	onInit() {
		const fields: (keyof GameModel)[] = [
			'tigrs_age',
			'tigrs_cartoon_violence',
			'tigrs_fantasy_violence',
			'tigrs_realistic_violence',
			'tigrs_bloodshed',
			'tigrs_sexual_violence',
			'tigrs_alcohol',
			'tigrs_drugs',
			'tigrs_tobacco',
			'tigrs_nudity',
			'tigrs_sexual_themes',
			'tigrs_language',
			'tigrs_humor',
			'tigrs_gambling',
		];

		for (const field of fields) {
			(form.formModel as any)[field] = form.formModel[field] || 0;
		}
	},
	onSubmitSuccess() {
		emit('submit');
	},
});
</script>

<template>
	<AppForm :controller="form" @changed="emit('changed', $event)">
		<AppFormGroup name="tigrs_age" :label="$gettext(`Age Rating`)">
			<p v-if="model && model._is_wip" class="help-block">
				<AppTranslate>
					If you don't know what the final content of your game will be, give an educated
					guess. You can make changes later.
				</AppTranslate>
			</p>

			<!-- skip the first element, it's a placeholder for unrated maturity that shouldn't be selectable -->
			<div v-for="(item, index) in age.slice(1)" :key="index" class="radio">
				<label>
					<AppFormControlRadio :value="index + 1" />
					{{ item.label }}
					<span v-if="item.description" class="help-inline">
						- {{ item.description }}
					</span>
				</label>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppExpand :when="form.formModel.tigrs_age !== 0">
			<fieldset>
				<legend><AppTranslate>Violence</AppTranslate></legend>

				<AppFormGroup name="tigrs_cartoon_violence" :label="$gettext(`Cartoon Violence`)">
					<div v-for="(item, index) in cartoonViolence" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="tigrs_fantasy_violence" :label="$gettext(`Fantasy Violence`)">
					<div v-for="(item, index) in fantasyViolence" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup
					name="tigrs_realistic_violence"
					:label="$gettext(`Realistic Violence`)"
				>
					<div v-for="(item, index) in realisticViolence" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="tigrs_bloodshed" :label="$gettext(`Bloodshed`)">
					<div v-for="(item, index) in bloodshed" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="tigrs_sexual_violence" :label="$gettext(`Sexual Violence`)">
					<div v-for="(item, index) in sexualViolence" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>
			</fieldset>

			<fieldset>
				<legend><AppTranslate>Substances</AppTranslate></legend>

				<AppFormGroup name="tigrs_alcohol" :label="$gettext(`Alcohol`)">
					<div v-for="(item, index) in alcohol" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="tigrs_drugs" :label="$gettext(`Drugs`)">
					<div v-for="(item, index) in drugs" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="tigrs_tobacco" :label="$gettext(`Tobacco`)">
					<div v-for="(item, index) in tobacco" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>
			</fieldset>

			<fieldset>
				<legend><AppTranslate>Sex/Nudity</AppTranslate></legend>

				<AppFormGroup name="tigrs_nudity" :label="$gettext(`Nudity`)">
					<div v-for="(item, index) in nudity" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="tigrs_sexual_themes" :label="$gettext(`Sexual Themes`)">
					<div v-for="(item, index) in sexualThemes" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>
			</fieldset>

			<fieldset>
				<legend><AppTranslate>Miscellaneous</AppTranslate></legend>

				<AppFormGroup name="tigrs_language" :label="$gettext(`Language`)">
					<div v-for="(item, index) in language" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="tigrs_humor" :label="$gettext(`Humor`)">
					<div v-for="(item, index) in humor" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="tigrs_gambling" :label="$gettext(`Gambling`)">
					<div v-for="(item, index) in gambling" :key="index" class="radio">
						<label>
							<AppFormControlRadio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>
			</fieldset>
		</AppExpand>

		<AppDashGameWizardControls :disabled="!form.formModel.tigrs_age">
			<AppFormButton :disabled="!form.formModel.tigrs_age || !form.valid">
				<AppTranslate>Save Maturity Details</AppTranslate>
			</AppFormButton>
		</AppDashGameWizardControls>
	</AppForm>
</template>
