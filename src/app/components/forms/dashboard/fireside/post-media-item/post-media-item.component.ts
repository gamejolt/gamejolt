export function FiresidePostMediaItemFormFactory(
	Form: any,
	MediaItem: any,
)
{
	const form = new Form( {
		model: 'MediaItem',
		template: '/app/components/forms/dashboard/fireside/post-media-item/post-media-item.component.html',
		resetOnSubmit: true,
	} );

	form.scope.post = '=gjPost';
	form.scope.type = '@?gjMediaItemType';

	form.onInit = function( scope: any )
	{
		// Set the post ID.
		scope.formModel.post_id = scope.post.id;

		if ( !scope.type || scope.type == 'image' ) {
			scope.formModel.type = MediaItem.TYPE_FIRESIDE_POST_IMAGE;
		}
		else if ( scope.type == 'header' ) {
			scope.formModel.type = MediaItem.TYPE_FIRESIDE_POST_HEADER;
		}
	};

	return form;
}
