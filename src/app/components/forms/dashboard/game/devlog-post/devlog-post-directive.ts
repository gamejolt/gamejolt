export function DevlogPostFormFactory( Form: any, Fireside_Post: any )
{
	const form = new Form( {
		model: 'Fireside_Post',
		template: '/app/components/forms/dashboard/game/devlog-post/devlog-post.html'
	} );

	form.onInit = function( scope: any )
	{
		scope.Fireside_Post = Fireside_Post;

		scope.formModel.status = Fireside_Post.STATUS_ACTIVE;

		scope.onDraftSubmit = () =>
		{
			scope.formModel.status = Fireside_Post.STATUS_DRAFT;
			scope.onSubmit();
		};
	};

	return form;
}
