import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Loader } from '../../../../../../lib/gj-lib-client/components/loader/loader.service';

DevlogPostFormFactory.$inject = [ 'Form', 'KeyGroup', 'Game_Video' ];
export function DevlogPostFormFactory( Form: any, KeyGroup: any, Game_Video: any )
{
	const form = new Form( {
		model: 'Fireside_Post',
		template: require( './devlog-post.html' )
	} );

	form.onInit = function( scope: any )
	{
		scope.Fireside_Post = FiresidePost;
		scope.Game_Video = Game_Video;

		scope.Loader = Loader;
		Loader.load( 'upload' );

		scope.formModel.status = FiresidePost.STATUS_ACTIVE;

		if ( scope.baseModel.type == FiresidePost.TYPE_VIDEO ) {
			if ( scope.baseModel.videos.length ) {
				scope.formModel.video_url = 'https://www.youtube.com/watch?v=' + scope.baseModel.videos[0].video_id;
			}
		}
		else if ( scope.baseModel.type == FiresidePost.TYPE_SKETCHFAB ) {
			if ( scope.baseModel.sketchfabs.length ) {
				scope.formModel.sketchfab_id = scope.baseModel.sketchfabs[0].sketchfab_id;
			}
		}

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
			scope.formModel.status = FiresidePost.STATUS_DRAFT;
			scope.onSubmit();
		};
	};

	return form;
}
