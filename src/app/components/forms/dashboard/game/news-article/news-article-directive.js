angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameNewsArticle', function( $state, Form, KeyGroup )
{
	var form = new Form( {
		model: 'Game_NewsArticle',
		template: '/app/components/forms/dashboard/game/news-article/news-article.html'
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		scope.$state = $state;
		scope.formModel.game_id = scope.game.id;

		scope.onLoaded = function( payload )
		{
			scope.keyGroups = KeyGroup.populate( payload.keyGroups );
		};

		scope.areKeyGroupsChosen = function()
		{
			if ( !scope.formModel.keyGroups ) {
				return false;
			}

			for ( var i in scope.formModel.keyGroups ) {
				if ( scope.formModel.keyGroups[ i ] ) {
					return true;
				}
			}

			return false;
		};
	};

	return form;
} );
