import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service.ts';
import { Comment_Video } from '../../../../lib/gj-lib-client/components/comment/video/video-model';

@Injectable()
export class VideosCtrl
{
	videos: Comment_Video[];
	page = 0;

	constructor(
		@Inject( '$scope' ) $scope: any,
		@Inject( '$stateParams' ) private $stateParams: ng.ui.IStateParamsService,
		@Inject( 'App' ) app: App,
		@Inject( 'Api' ) private api: any,
		@Inject( 'Comment_Video' ) private commentVideo: typeof Comment_Video,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'Videos from {{ user }}', { user: $scope.profileCtrl.user.display_name } );

		this.videos = commentVideo.populate( payload.videos );
	}

	loadMore()
	{
		++this.page;
		this.api.sendRequest( `/web/profile/videos/${this.$stateParams['id']}?page=${this.page}` )
			.then( ( response: any ) =>
			{
				this.videos = this.videos.concat( this.commentVideo.populate( response.videos ) );
			} );
	}
}
