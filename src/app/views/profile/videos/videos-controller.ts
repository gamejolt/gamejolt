import { App } from './../../../app-service.ts';
import { Comment_Video } from '../../../../lib/gj-lib-client/components/comment/video/video-model';

export class VideosCtrl
{
	videos: any[];

	static $inject = [ '$scope', 'App', 'Comment_Video', 'gettextCatalog', 'payload' ];

	constructor(
		$scope,
		app: App,
		commentVideo: typeof Comment_Video,
		gettextCatalog: ng.gettext.gettextCatalog,
		payload: any
	)
	{
		app.title = gettextCatalog.getString( 'Videos from {{ user }}', { user: $scope.profileCtrl.user.display_name } );

		this.videos = commentVideo.populate( payload.videos );
	}
}
