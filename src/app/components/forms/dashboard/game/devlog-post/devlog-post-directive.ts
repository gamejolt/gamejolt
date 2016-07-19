import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';

export function DevlogPostFormFactory( Form: any, firesidePostModel: typeof Fireside_Post )
{
	const form = new Form( {
		model: 'Fireside_Post',
		template: '/app/components/forms/dashboard/game/devlog-post/devlog-post.html'
	} );

	form.onInit = function( scope: any )
	{
		scope.Fireside_Post = firesidePostModel;

		scope.formModel.status = firesidePostModel.STATUS_ACTIVE;

		scope.onDraftSubmit = () =>
		{
			scope.formModel.status = firesidePostModel.STATUS_DRAFT;
			scope.onSubmit();
		};
	};

	return form;
}
