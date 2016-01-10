angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameMaturity', function( $translate, Form )
{
	var form = new Form( {
		model: 'Game',
		saveMethod: '$saveMaturity',
		template: '/app/components/forms/dashboard/game/maturity/maturity.html',
	} );

	form.onInit = function( scope )
	{
		scope.age = [
			{
				// Placeholder for unrated.
				// Can't select it in the UI, but it's needed to push the index for the other ones.
			},
			{
				label: $translate.instant( 'dash.games.maturity.age_everyone_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.age_teen_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.age_mature_option' ),
			},
		];

		scope.cartoonViolence = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.mild_option' ),
				description: $translate.instant( 'dash.games.maturity.cartoon_violence_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.moderate_option' ),
				description: $translate.instant( 'dash.games.maturity.cartoon_violence_2_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.intense_option' ),
				description: $translate.instant( 'dash.games.maturity.cartoon_violence_3_description' ),
			},
		];

		scope.fantasyViolence = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.mild_option' ),
				description: $translate.instant( 'dash.games.maturity.fantasy_violence_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.moderate_option' ),
				description: $translate.instant( 'dash.games.maturity.fantasy_violence_2_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.intense_option' ),
				description: $translate.instant( 'dash.games.maturity.fantasy_violence_3_description' ),
			},
		];

		scope.realisticViolence = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.mild_option' ),
				description: $translate.instant( 'dash.games.maturity.realistic_violence_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.moderate_option' ),
				description: $translate.instant( 'dash.games.maturity.realistic_violence_2_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.intense_option' ),
				description: $translate.instant( 'dash.games.maturity.realistic_violence_3_description' ),
			},
		];

		scope.bloodshed = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.mild_option' ),
				description: $translate.instant( 'dash.games.maturity.bloodshed_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.moderate_option' ),
				description: $translate.instant( 'dash.games.maturity.bloodshed_2_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.intense_option' ),
				description: $translate.instant( 'dash.games.maturity.bloodshed_3_description' ),
			},
		];

		scope.sexualViolence = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.sexual_violence_label' ),
				description: $translate.instant( 'dash.games.maturity.sexual_violence_description' ),
			},
		];

		scope.alcohol = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.reference_option' ),
				description: $translate.instant( 'dash.games.maturity.alcohol_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.use_option' ),
				description: $translate.instant( 'dash.games.maturity.alcohol_2_description' ),
			},
		];

		scope.drugs = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.reference_option' ),
				description: $translate.instant( 'dash.games.maturity.drugs_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.use_option' ),
				description: $translate.instant( 'dash.games.maturity.drugs_2_description' ),
			},
		];

		scope.tobacco = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.reference_option' ),
				description: $translate.instant( 'dash.games.maturity.tobacco_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.use_option' ),
				description: $translate.instant( 'dash.games.maturity.tobacco_2_description' ),
			},
		];

		scope.nudity = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.brief_nudity_option' ),
				description: $translate.instant( 'dash.games.maturity.nudity_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.full_nudity_option' ),
				description: $translate.instant( 'dash.games.maturity.nudity_2_description' ),
			},
		];

		scope.sexualThemes = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.suggestive_option' ),
				description: $translate.instant( 'dash.games.maturity.sexual_themes_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.moderate_option' ),
				description: $translate.instant( 'dash.games.maturity.sexual_themes_2_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.graphic_option' ),
				description: $translate.instant( 'dash.games.maturity.sexual_themes_3_description' ),
			},
		];

		scope.language = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.mild_option' ),
				description: $translate.instant( 'dash.games.maturity.language_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.moderate_option' ),
				description: $translate.instant( 'dash.games.maturity.language_2_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.strong_option' ),
				description: $translate.instant( 'dash.games.maturity.language_3_description' ),
			},
		];

		scope.humor = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.shenanigans_option' ),
				description: $translate.instant( 'dash.games.maturity.humor_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.moderate_option' ),
				description: $translate.instant( 'dash.games.maturity.humor_2_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.strong_option' ),
				description: $translate.instant( 'dash.games.maturity.humor_3_description' ),
			},
		];

		scope.gambling = [
			{
				label: $translate.instant( 'dash.games.maturity.none_option' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.simulated_option' ),
				description: $translate.instant( 'dash.games.maturity.gambling_1_description' ),
			},
			{
				label: $translate.instant( 'dash.games.maturity.real_gambling_option' ),
				description: $translate.instant( 'dash.games.maturity.gambling_2_description' ),
			},
		];

		var fields = [
			'age',
			'cartoon_violence',
			'fantasy_violence',
			'realistic_violence',
			'bloodshed',
			'sexual_violence',
			'alcohol',
			'drugs',
			'tobacco',
			'nudity',
			'sexual_themes',
			'language',
			'humor',
			'gambling',
		];

		fields.forEach( function( field )
		{
			scope.formModel['tigrs_' + field] = scope.formModel['tigrs_' + field] || 0;
		} );
	};

	return form;
} );
