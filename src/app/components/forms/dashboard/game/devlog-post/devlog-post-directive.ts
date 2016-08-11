export function DevlogPostFormFactory( Form: any, Fireside_Post: any, KeyGroup: any, Game_Video: any )
{
	const form = new Form( {
		model: 'Fireside_Post',
		template: '/app/components/forms/dashboard/game/devlog-post/devlog-post.html'
	} );

	form.onInit = function( scope: any )
	{
		scope.Fireside_Post = Fireside_Post;
		scope.Game_Video = Game_Video;

		scope.formModel.status = Fireside_Post.STATUS_ACTIVE;

		// For editing, we should pull the currently selected key groups into the form.
		scope.formModel.keyGroups = {};
		if ( scope.baseModel.key_groups && scope.baseModel.key_groups.length ) {
			for ( const keyGroup of scope.baseModel.key_groups ) {
				scope.formModel.keyGroups[ keyGroup.id ] = true;
			}
		}

		scope.onLoaded = ( payload: any ) =>
		{
			scope.keyGroups = KeyGroup.populate( payload.keyGroups );
			scope.hasMediaItems = payload.hasMediaItems;
			scope.wasPublished = payload.wasPublished;
			scope.maxFilesize = payload.maxFilesize;
			scope.maxWidth = payload.maxWidth;
			scope.maxHeight = payload.maxHeight;
		};

		scope.areKeyGroupsChosen = () =>
		{
			if ( !scope.formModel.keyGroups ) {
				return false;
			}

			for ( const val of scope.formModel.keyGroups ) {
				if ( val ) {
					return true;
				}
			}

			return false;
		};

		scope.onDraftSubmit = () =>
		{
			scope.formModel.status = Fireside_Post.STATUS_DRAFT;
			scope.onSubmit();
		};
	};

	return form;
}
