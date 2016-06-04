angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameDevlogPost', function( Form )
{
	var form = new Form( {
		model: 'Fireside_Post',
		template: '/app/components/forms/dashboard/game/devlog-post/devlog-post.html'
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		scope.formModel.game_id = scope.game.id;
	};

	return form;
} );
