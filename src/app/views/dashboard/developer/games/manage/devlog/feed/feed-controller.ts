import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from '../../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedService } from './../../../../../../../components/activity/feed/feed-service';
import { ActivityFeedContainer } from './../../../../../../../components/activity/feed/feed-container-service';

@Injectable()
export class FeedCtrl
{
	tab: 'draft' | 'active';
	posts: ActivityFeedContainer;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( '$stateParams' ) private $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post,
		@Inject( 'ActivityFeedService' ) feedService: ActivityFeedService,
		@Inject( 'payload' ) payload: any,
	)
	{
		this.tab = $stateParams['tab'];
		this.posts = feedService.bootstrap( firesidePostModel.populate( payload.posts ) );

		$scope.$on( 'Devlog.postAdded', ( _event: ng.IAngularEvent, post: Fireside_Post ) => this.onPostAdded( post ) );
	}

	onPostAdded( post: Fireside_Post )
	{
		// If they added into a different status, then switch tabs.
		if ( this.$stateParams['tab'] != post.status ) {
			this.$state.go( this.$state.current, { tab: post.status } );
			return;
		}

		this.posts.prepend( [ post ] );
	}

	onPostPublished( post: Fireside_Post )
	{
		this.$state.go( this.$state.current, { tab: post.status } );
	}
}
