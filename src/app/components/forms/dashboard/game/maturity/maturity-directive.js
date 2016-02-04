angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameMaturity', function( Form, gettextCatalog )
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
				label: gettextCatalog.getString( 'dash.games.maturity.age_everyone_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.age_teen_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.age_mature_option' ),
			},
		];

		scope.cartoonViolence = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.mild_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.cartoon_violence_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.moderate_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.cartoon_violence_2_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.intense_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.cartoon_violence_3_description' ),
			},
		];

		scope.fantasyViolence = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.mild_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.fantasy_violence_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.moderate_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.fantasy_violence_2_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.intense_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.fantasy_violence_3_description' ),
			},
		];

		scope.realisticViolence = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.mild_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.realistic_violence_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.moderate_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.realistic_violence_2_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.intense_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.realistic_violence_3_description' ),
			},
		];

		scope.bloodshed = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.mild_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.bloodshed_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.moderate_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.bloodshed_2_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.intense_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.bloodshed_3_description' ),
			},
		];

		scope.sexualViolence = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.sexual_violence_label' ),
				description: gettextCatalog.getString( 'dash.games.maturity.sexual_violence_description' ),
			},
		];

		scope.alcohol = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.reference_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.alcohol_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.use_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.alcohol_2_description' ),
			},
		];

		scope.drugs = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.reference_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.drugs_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.use_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.drugs_2_description' ),
			},
		];

		scope.tobacco = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.reference_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.tobacco_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.use_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.tobacco_2_description' ),
			},
		];

		scope.nudity = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.brief_nudity_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.nudity_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.full_nudity_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.nudity_2_description' ),
			},
		];

		scope.sexualThemes = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.suggestive_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.sexual_themes_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.moderate_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.sexual_themes_2_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.graphic_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.sexual_themes_3_description' ),
			},
		];

		scope.language = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.mild_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.language_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.moderate_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.language_2_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.strong_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.language_3_description' ),
			},
		];

		scope.humor = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.shenanigans_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.humor_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.moderate_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.humor_2_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.strong_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.humor_3_description' ),
			},
		];

		scope.gambling = [
			{
				label: gettextCatalog.getString( 'dash.games.maturity.none_option' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.simulated_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.gambling_1_description' ),
			},
			{
				label: gettextCatalog.getString( 'dash.games.maturity.real_gambling_option' ),
				description: gettextCatalog.getString( 'dash.games.maturity.gambling_2_description' ),
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
