export function DevlogPostFormFactory( Form, Fireside_Post )
{
	const form = new Form( {
		model: 'Fireside_Post',
		template: '/app/components/forms/dashboard/game/devlog-post/devlog-post.html'
	} );

	form.scope.game = '=gjGame';
	form.scope.postType = '=';

	form.onInit = function( scope )
	{
		scope.Fireside_Post = Fireside_Post;

		scope.formModel.game_id = scope.game.id;

		scope.formModel.status = Fireside_Post.STATUS_ACTIVE;

		scope.$watch( 'postType', function()
		{
			console.log( 'hi' );
		} );

		// scope.$watch( __ => scope.postType, __ =>
		// {
		// 	console.log( 'yooooo', scope.postType );
		// 	scope.formModel.type = scope.postType;
		// } );
	};

	return form;
}
