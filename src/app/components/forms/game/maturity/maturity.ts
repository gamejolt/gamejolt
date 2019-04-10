import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Component } from 'vue-property-decorator';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';

type MaturityField = {
	label?: string;
	description?: string;
};

@Component({
	components: {
		AppExpand,
		AppDashGameWizardControls,
	},
})
export default class FormGameMaturity extends BaseForm<Game> implements FormOnInit {
	modelClass = Game;

	age: MaturityField[] = [
		{
			// Placeholder for unrated.
			// Can't select it in the UI, but it's needed to push the index for the other ones.
		},
		{
			label: this.$gettext('dash.games.maturity.age_everyone_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.age_teen_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.age_mature_option'),
		},
	];

	cartoonViolence: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.mild_option'),
			description: this.$gettext('dash.games.maturity.cartoon_violence_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.moderate_option'),
			description: this.$gettext('dash.games.maturity.cartoon_violence_2_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.intense_option'),
			description: this.$gettext('dash.games.maturity.cartoon_violence_3_description'),
		},
	];

	fantasyViolence: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.mild_option'),
			description: this.$gettext('dash.games.maturity.fantasy_violence_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.moderate_option'),
			description: this.$gettext('dash.games.maturity.fantasy_violence_2_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.intense_option'),
			description: this.$gettext('dash.games.maturity.fantasy_violence_3_description'),
		},
	];

	realisticViolence: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.mild_option'),
			description: this.$gettext('dash.games.maturity.realistic_violence_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.moderate_option'),
			description: this.$gettext('dash.games.maturity.realistic_violence_2_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.intense_option'),
			description: this.$gettext('dash.games.maturity.realistic_violence_3_description'),
		},
	];

	bloodshed: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.mild_option'),
			description: this.$gettext('dash.games.maturity.bloodshed_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.moderate_option'),
			description: this.$gettext('dash.games.maturity.bloodshed_2_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.intense_option'),
			description: this.$gettext('dash.games.maturity.bloodshed_3_description'),
		},
	];

	sexualViolence: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.sexual_violence_label'),
			description: this.$gettext('dash.games.maturity.sexual_violence_description'),
		},
	];

	alcohol: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.reference_option'),
			description: this.$gettext('dash.games.maturity.alcohol_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.use_option'),
			description: this.$gettext('dash.games.maturity.alcohol_2_description'),
		},
	];

	drugs: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.reference_option'),
			description: this.$gettext('dash.games.maturity.drugs_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.use_option'),
			description: this.$gettext('dash.games.maturity.drugs_2_description'),
		},
	];

	tobacco: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.reference_option'),
			description: this.$gettext('dash.games.maturity.tobacco_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.use_option'),
			description: this.$gettext('dash.games.maturity.tobacco_2_description'),
		},
	];

	nudity: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.brief_nudity_option'),
			description: this.$gettext('dash.games.maturity.nudity_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.full_nudity_option'),
			description: this.$gettext('dash.games.maturity.nudity_2_description'),
		},
	];

	sexualThemes: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.suggestive_option'),
			description: this.$gettext('dash.games.maturity.sexual_themes_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.moderate_option'),
			description: this.$gettext('dash.games.maturity.sexual_themes_2_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.graphic_option'),
			description: this.$gettext('dash.games.maturity.sexual_themes_3_description'),
		},
	];

	language: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.mild_option'),
			description: this.$gettext('dash.games.maturity.language_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.moderate_option'),
			description: this.$gettext('dash.games.maturity.language_2_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.strong_option'),
			description: this.$gettext('dash.games.maturity.language_3_description'),
		},
	];

	humor: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.shenanigans_option'),
			description: this.$gettext('dash.games.maturity.humor_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.moderate_option'),
			description: this.$gettext('dash.games.maturity.humor_2_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.strong_option'),
			description: this.$gettext('dash.games.maturity.humor_3_description'),
		},
	];

	gambling: MaturityField[] = [
		{
			label: this.$gettext('dash.games.maturity.none_option'),
		},
		{
			label: this.$gettext('dash.games.maturity.simulated_option'),
			description: this.$gettext('dash.games.maturity.gambling_1_description'),
		},
		{
			label: this.$gettext('dash.games.maturity.real_gambling_option'),
			description: this.$gettext('dash.games.maturity.gambling_2_description'),
		},
	];

	onInit() {
		this.saveMethod = '$saveMaturity';

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

		for (let field of fields) {
			(this.formModel as any)[field] = this.formModel[field] || 0;
		}
	}
}
