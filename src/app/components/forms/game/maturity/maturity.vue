<script lang="ts">
import { Emit, mixins, Options } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';

type MaturityField = {
	label?: string;
	description?: string;
};

class Wrapper extends BaseForm<Game> {}

@Options({
	components: {
		AppExpand,
		AppDashGameWizardControls,
	},
})
export default class FormGameMaturity extends mixins(Wrapper) {
	modelClass = Game;
	saveMethod = '$saveMaturity' as const;

	age: MaturityField[] = [
		{
			// Placeholder for unrated.
			// Can't select it in the UI, but it's needed to push the index for the other ones.
		},
		{
			label: $gettext('dash.games.maturity.age_everyone_option'),
		},
		{
			label: $gettext('dash.games.maturity.age_teen_option'),
		},
		{
			label: $gettext('dash.games.maturity.age_mature_option'),
		},
	];

	cartoonViolence: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.mild_option'),
			description: $gettext('dash.games.maturity.cartoon_violence_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.moderate_option'),
			description: $gettext('dash.games.maturity.cartoon_violence_2_description'),
		},
		{
			label: $gettext('dash.games.maturity.intense_option'),
			description: $gettext('dash.games.maturity.cartoon_violence_3_description'),
		},
	];

	fantasyViolence: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.mild_option'),
			description: $gettext('dash.games.maturity.fantasy_violence_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.moderate_option'),
			description: $gettext('dash.games.maturity.fantasy_violence_2_description'),
		},
		{
			label: $gettext('dash.games.maturity.intense_option'),
			description: $gettext('dash.games.maturity.fantasy_violence_3_description'),
		},
	];

	realisticViolence: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.mild_option'),
			description: $gettext('dash.games.maturity.realistic_violence_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.moderate_option'),
			description: $gettext('dash.games.maturity.realistic_violence_2_description'),
		},
		{
			label: $gettext('dash.games.maturity.intense_option'),
			description: $gettext('dash.games.maturity.realistic_violence_3_description'),
		},
	];

	bloodshed: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.mild_option'),
			description: $gettext('dash.games.maturity.bloodshed_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.moderate_option'),
			description: $gettext('dash.games.maturity.bloodshed_2_description'),
		},
		{
			label: $gettext('dash.games.maturity.intense_option'),
			description: $gettext('dash.games.maturity.bloodshed_3_description'),
		},
	];

	sexualViolence: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.sexual_violence_label'),
			description: $gettext('dash.games.maturity.sexual_violence_description'),
		},
	];

	alcohol: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.reference_option'),
			description: $gettext('dash.games.maturity.alcohol_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.use_option'),
			description: $gettext('dash.games.maturity.alcohol_2_description'),
		},
	];

	drugs: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.reference_option'),
			description: $gettext('dash.games.maturity.drugs_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.use_option'),
			description: $gettext('dash.games.maturity.drugs_2_description'),
		},
	];

	tobacco: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.reference_option'),
			description: $gettext('dash.games.maturity.tobacco_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.use_option'),
			description: $gettext('dash.games.maturity.tobacco_2_description'),
		},
	];

	nudity: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.brief_nudity_option'),
			description: $gettext('dash.games.maturity.nudity_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.full_nudity_option'),
			description: $gettext('dash.games.maturity.nudity_2_description'),
		},
	];

	sexualThemes: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.suggestive_option'),
			description: $gettext('dash.games.maturity.sexual_themes_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.moderate_option'),
			description: $gettext('dash.games.maturity.sexual_themes_2_description'),
		},
		{
			label: $gettext('dash.games.maturity.graphic_option'),
			description: $gettext('dash.games.maturity.sexual_themes_3_description'),
		},
	];

	language: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.mild_option'),
			description: $gettext('dash.games.maturity.language_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.moderate_option'),
			description: $gettext('dash.games.maturity.language_2_description'),
		},
		{
			label: $gettext('dash.games.maturity.strong_option'),
			description: $gettext('dash.games.maturity.language_3_description'),
		},
	];

	humor: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.shenanigans_option'),
			description: $gettext('dash.games.maturity.humor_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.moderate_option'),
			description: $gettext('dash.games.maturity.humor_2_description'),
		},
		{
			label: $gettext('dash.games.maturity.strong_option'),
			description: $gettext('dash.games.maturity.humor_3_description'),
		},
	];

	gambling: MaturityField[] = [
		{
			label: $gettext('dash.games.maturity.none_option'),
		},
		{
			label: $gettext('dash.games.maturity.simulated_option'),
			description: $gettext('dash.games.maturity.gambling_1_description'),
		},
		{
			label: $gettext('dash.games.maturity.real_gambling_option'),
			description: $gettext('dash.games.maturity.gambling_2_description'),
		},
	];

	@Emit('changed')
	emitChanged(_game: Game) {}

	onInit() {
		const fields: (keyof Game)[] = [
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
	<app-form :controller="form" @changed="emitChanged($event)">
		<app-form-group name="tigrs_age" :label="$gettext(`dash.games.maturity.age_label`)">
			<p v-if="model._is_wip" class="help-block">
				<translate>dash.games.maturity.wip_help</translate>
			</p>

			<!-- skip the first element, it's a placeholder for unrated maturity that shouldn't be selectable -->
			<div v-for="(item, index) in age.slice(1)" :key="index" class="radio">
				<label>
					<app-form-control-radio :value="index + 1" />
					{{ item.label }}
					<span v-if="item.description" class="help-inline">
						- {{ item.description }}
					</span>
				</label>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<app-expand :when="formModel.tigrs_age !== 0">
			<fieldset>
				<legend><translate>dash.games.maturity.violence_legend</translate></legend>

				<app-form-group
					name="tigrs_cartoon_violence"
					:label="$gettext(`dash.games.maturity.cartoon_violence_label`)"
				>
					<div v-for="(item, index) in cartoonViolence" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					name="tigrs_fantasy_violence"
					:label="$gettext(`dash.games.maturity.fantasy_violence_label`)"
				>
					<div v-for="(item, index) in fantasyViolence" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					name="tigrs_realistic_violence"
					:label="$gettext(`dash.games.maturity.realistic_violence_label`)"
				>
					<div v-for="(item, index) in realisticViolence" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					name="tigrs_bloodshed"
					:label="$gettext(`dash.games.maturity.bloodshed_label`)"
				>
					<div v-for="(item, index) in bloodshed" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					name="tigrs_sexual_violence"
					:label="$gettext(`dash.games.maturity.sexual_violence_label`)"
				>
					<div v-for="(item, index) in sexualViolence" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>
			</fieldset>

			<fieldset>
				<legend><translate>dash.games.maturity.substances_legend</translate></legend>

				<app-form-group
					name="tigrs_alcohol"
					:label="$gettext(`dash.games.maturity.alcohol_label`)"
				>
					<div v-for="(item, index) in alcohol" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					name="tigrs_drugs"
					:label="$gettext(`dash.games.maturity.drugs_label`)"
				>
					<div v-for="(item, index) in drugs" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					name="tigrs_tobacco"
					:label="$gettext(`dash.games.maturity.tobacco_label`)"
				>
					<div v-for="(item, index) in tobacco" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>
			</fieldset>

			<fieldset>
				<legend><translate>dash.games.maturity.sex_nudity_legend</translate></legend>

				<app-form-group
					name="tigrs_nudity"
					:label="$gettext(`dash.games.maturity.nudity_label`)"
				>
					<div v-for="(item, index) in nudity" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					name="tigrs_sexual_themes"
					:label="$gettext(`dash.games.maturity.sexual_themes_label`)"
				>
					<div v-for="(item, index) in sexualThemes" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>
			</fieldset>

			<fieldset>
				<legend><translate>dash.games.maturity.misc_legend</translate></legend>

				<app-form-group
					name="tigrs_language"
					:label="$gettext(`dash.games.maturity.language_label`)"
				>
					<div v-for="(item, index) in language" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					name="tigrs_humor"
					:label="$gettext(`dash.games.maturity.humor_label`)"
				>
					<div v-for="(item, index) in humor" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group
					name="tigrs_gambling"
					:label="$gettext(`dash.games.maturity.gambling_label`)"
				>
					<div v-for="(item, index) in gambling" :key="index" class="radio">
						<label>
							<app-form-control-radio :value="index" />
							{{ item.label }}
							<span v-if="item.description" class="help-inline">
								- {{ item.description }}
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>
			</fieldset>
		</app-expand>

		<app-dash-game-wizard-controls :disabled="!formModel.tigrs_age">
			<app-form-button :disabled="!formModel.tigrs_age || !valid">
				<translate>dash.games.maturity.save_button</translate>
			</app-form-button>
		</app-dash-game-wizard-controls>
	</app-form>
</template>
