import { Emit, mixins, Options } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/expand.vue';
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

	created() {
		this.form.saveMethod = '$saveMaturity';
	}

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