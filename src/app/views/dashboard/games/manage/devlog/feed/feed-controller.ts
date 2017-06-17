import { Injectable, Inject } from 'ng-metadata/core';
import { StateService, StateParams } from 'angular-ui-router';

import { FiresidePost } from '../../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedService } from '../../../../../../../components/activity/feed/feed-service';
import { ActivityFeedContainer } from '../../../../../../../components/activity/feed/feed-container-service';

@Injectable()
export class FeedCtrl {
	tab: 'draft' | 'active';
	posts: ActivityFeedContainer;

	constructor(
		@Inject('$scope') $scope: ng.IScope,
		@Inject('$state') private $state: StateService,
		@Inject('$stateParams') private $stateParams: StateParams,
		@Inject('payload') payload: any,
	) {
		this.tab = $stateParams['tab'];
		this.posts = ActivityFeedService.bootstrap(
			FiresidePost.populate(payload.posts),
		);

		$scope.$on(
			'Devlog.postAdded',
			(_event: ng.IAngularEvent, post: FiresidePost) => this.onPostAdded(post),
		);
	}

	onPostAdded(post: FiresidePost) {
		// If they added into a different status, then switch tabs.
		if (this.$stateParams['tab'] !== post.status) {
			this.$state.go(this.$state.current, { tab: post.status });
			return;
		}

		this.posts.prepend([post]);
	}

	onPostPublished(post: FiresidePost) {
		this.$state.go(this.$state.current, { tab: post.status });
	}
}
