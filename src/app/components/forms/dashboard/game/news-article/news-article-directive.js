angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameNewsArticle', function( Form )
{
	var form = new Form( {
		model: 'Game_NewsArticle',
		template: '/app/components/forms/dashboard/game/news-article/news-article.html'
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		scope.formModel.game_id = scope.game.id;
	};

	return form;
} );
