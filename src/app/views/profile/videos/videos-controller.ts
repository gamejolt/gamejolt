import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service.ts';
import { Comment_Video } from '../../../../lib/gj-lib-client/components/comment/video/video-model';

@Injectable()
export class VideosCtrl
{
	videos: any[];

	constructor(
		@Inject( '$scope' ) $scope,
		@Inject( 'App' ) app: App,
		@Inject( 'Comment_Video' ) commentVideo: typeof Comment_Video,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'Videos from {{ user }}', { user: $scope.profileCtrl.user.display_name } );

		this.videos = commentVideo.populate( payload.videos );
	}
}
