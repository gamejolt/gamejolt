angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameScoreTable', function( Form, Game_ScoreTable )
{
	var form = new Form( {
		model: 'Game_ScoreTable',
		template: require( './score-table.html' )
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		// Set the game ID on the form model from the game passed in.
		scope.formModel.game_id = scope.game.id;

		// If we're adding, set some defaults.
		if ( scope.method == 'add' ) {
			scope.formModel.unique_scores = true;
			scope.formModel.scores_sorting_direction = Game_ScoreTable.SORTING_DIRECTION_DESC;
		}
	};

	return form;
} );
