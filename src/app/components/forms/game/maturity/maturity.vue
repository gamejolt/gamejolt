<script lang="ts">
import { Emit, mixins, Options } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { $saveGameMaturity, GameModel } from '../../../../../_common/game/game.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppDashGameWizardControls from '../wizard-controls/AppDashGameWizardControls.vue';

type MaturityField = {
	label?: string;
	description?: string;
};

class Wrapper extends BaseForm<GameModel> {}

@Options({
	components: {
		AppExpand,
		AppDashGameWizardControls,
	},
})
export default class FormGameMaturity extends mixins(Wrapper) {
	modelClass = GameModel;
	modelSaveHandler = $saveGameMaturity;

	age: MaturityField[] = [
		{
			// Placeholder for unrated.
			// Can't select it in the UI, but it's needed to push the index for the other ones.
		},
		{
			label: $gettext('All Ages'),
		},
		{
			label: $gettext('Teen Content'),
		},
		{
			label: $gettext('Mature Content'),
		},
	];

	cartoonViolence: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Mild'),
			description: $gettext('Depictions of cartoon-like characters in unsafe situations.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Moderate'),
			description: $gettext('Depictions of cartoon-like characters in aggressive conflict.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Intense'),
			description: $gettext(
				'Graphic depictions of violence involving cartoon-like characters.'
			),
		},
	];

	fantasyViolence: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Mild'),
			description: $gettext(
				'Depictions of characters in unsafe situations easily distinguishable from real life.'
			),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Moderate'),
			description: $gettext(
				'Depictions of characters in aggressive conflict easily distinguishable from real life.'
			),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Intense'),
			description: $gettext(
				'Graphic depictions of violence involving situations easily distinguishable from real life.'
			),
		},
	];

	realisticViolence: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Mild'),
			description: $gettext('Mild depictions of realistic characters in unsafe situations.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Moderate'),
			description: $gettext('Depictions of realistic characters in aggressive conflict.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Intense'),
			description: $gettext('Graphic depictions of violence involving realistic characters.'),
		},
	];

	bloodshed: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Mild'),
			description: $gettext('Unrealistic depictions of bloodshed.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Moderate'),
			description: $gettext('Realistic depictions of bloodshed.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Intense'),
			description: $gettext('Depictions of bloodshed and the mutilation of body parts.'),
		},
	];

	sexualViolence: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			label: $gettext('Sexual Violence'),
			description: $gettext(
				'Depictions of or graphic references to rape or other violent sexual behavior.'
			),
		},
	];

	alcohol: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			// TODO(vue3) translate-comment="As in has a reference to this topic"
			label: $gettext('Reference'),
			description: $gettext('References to or images of alcoholic beverages.'),
		},
		{
			// TODO(vue3) translate-comment="As in the usage / consumption of something"
			label: $gettext('Use'),
			description: $gettext('Use of alcoholic beverages.'),
		},
	];

	drugs: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			// TODO(vue3) translate-comment="As in has a reference to this topic"
			label: $gettext('Reference'),
			description: $gettext('References to or images of illicit drugs.'),
		},
		{
			// TODO(vue3) translate-comment="As in the usage / consumption of something"
			label: $gettext('Use'),
			description: $gettext('Use of illicit drugs.'),
		},
	];

	tobacco: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			// TODO(vue3) translate-comment="As in has a reference to this topic"
			label: $gettext('Reference'),
			description: $gettext('References to or images of tobacco products.'),
		},
		{
			// TODO(vue3) translate-comment="As in the usage / consumption of something"
			label: $gettext('Use'),
			description: $gettext('Use of tobacco products.'),
		},
	];

	nudity: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			label: $gettext('Brief Nudity'),
			description: $gettext('Brief depictions of nudity or artistic nudity.'),
		},
		{
			label: $gettext('Nudity'),
			description: $gettext('Prolonged depictions of nudity.'),
		},
	];

	sexualThemes: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			label: $gettext('Suggestive'),
			description: $gettext('Provocative references or depictions of provocative behavior.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Moderate'),
			description: $gettext('Sexual references or depictions of sexual behavior.'),
		},
		{
			// TODO(vue3) translate-comment="As in graphic content"
			label: $gettext('Graphic'),
			description: $gettext('Graphic depictions of sexual behavior.'),
		},
	];

	language: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Mild'),
			description: $gettext('Mild or infrequent use of profanity.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Moderate'),
			description: $gettext('Moderate use of profanity.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Strong'),
			description: $gettext('Strong or frequent use of profanity.'),
		},
	];

	humor: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			label: $gettext('Comic Shenanigans'),
			description: $gettext('Depictions of or dialog including slapstick humor.'),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Moderate'),
			description: $gettext(
				'Depictions of or dialog including vulgar humor; bathroom humor.'
			),
		},
		{
			// TODO(vue3) translate-comment="Used as a quantity/tendency"
			label: $gettext('Strong'),
			description: $gettext('Depictions of or dialog including mature humor; sexual humor.'),
		},
	];

	gambling: MaturityField[] = [
		{
			label: $gettext('None'),
		},
		{
			label: $gettext('Simulated'),
			description: $gettext('Players can gamble using "play" money.'),
		},
		{
			label: $gettext('Real Gambling'),
			description: $gettext('Players can gamble using real money.'),
		},
	];

	@Emit('changed')
	emitChanged(_game: GameModel) {}

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
			(this.formModel as any)[field] = this.formModel[field] || 0;
		}
	}
}
</script>

<template>
	<AppForm :controller="form" @changed="emitChanged($event)">
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

		<AppExpand :when="formModel.tigrs_age !== 0">
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

		<AppDashGameWizardControls :disabled="!formModel.tigrs_age">
			<AppFormButton :disabled="!formModel.tigrs_age || !valid">
				<AppTranslate>Save Maturity Details</AppTranslate>
			</AppFormButton>
		</AppDashGameWizardControls>
	</AppForm>
</template>
