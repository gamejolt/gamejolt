import { Injectable, Inject } from 'ng-metadata/core';
import { StateParams } from 'angular-ui-router';

import { App } from '../../../app-service';
import { CommentVideo } from '../../../../lib/gj-lib-client/components/comment/video/video-model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

@Injectable()
export class VideosCtrl {
	videos: CommentVideo[];
	page = 0;

	constructor(
		@Inject('$scope') $scope: any,
		@Inject('$stateParams') private $stateParams: StateParams,
		@Inject('App') app: App,
		@Inject('payload') payload: any
	) {
		app.title = `Videos from ${$scope.profileCtrl.user.display_name} (@${$scope.profileCtrl.user
			.username})`;

		this.videos = CommentVideo.populate(payload.videos);
	}

	loadMore() {
		++this.page;
		Api.sendRequest(
			`/web/profile/videos/${this.$stateParams['id']}?page=${this.page}`
		).then((response: any) => {
			this.videos = this.videos.concat(CommentVideo.populate(response.videos));
		});
	}
}
