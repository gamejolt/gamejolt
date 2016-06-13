angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameDevlogPost', function( Form, Fireside_Post )
{
	var form = new Form( {
		model: 'Fireside_Post',
		template: '/app/components/forms/dashboard/game/devlog-post/devlog-post.html'
	} );

	form.scope.game = '=gjGame';
	form.scope.postType = '=';

	form.onInit = function( scope )
	{
		scope.Fireside_Post = Fireside_Post;

		scope.formModel.game_id = scope.game.id;
		scope.formModel.type = scope.postType;

		scope.formModel.status = Fireside_Post.STATUS_ACTIVE;
	};

	return form;
} );
