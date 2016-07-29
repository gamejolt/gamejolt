import { Component, Input, Output, Inject, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Fireside_Post_Like } from './../../../../../../lib/gj-lib-client/components/fireside/post/like/like-model';
import { App } from './../../../../../app-service';
import { DevlogPostEdit } from './../../../../devlog/post/edit/edit-service';
import { FeedComponent } from './../../feed-directive';
import { Clipboard } from './../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import template from 'html!./controls.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-controls',
	template,
})
export class ControlsComponent
{
	@Input( '<' ) post: Fireside_Post;

	@Output() onExpand?: Function;

	isShowingComments = false;
	isShowingLikes = false;
	hasLoadedLikes = false;
	likes: Fireside_Post_Like[] = [];

	isShowingShare = false;
	shareUrl: string;

	constructor(
		@Inject( '$state' ) $state: ng.ui.IStateService,
		@Inject( 'App' ) public app: App,
		@Inject( 'Environment' ) env: any,
		@Inject( 'Clipboard' ) private clipboard: Clipboard,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'Fireside_Post' ) public firesidePostModel: typeof Fireside_Post,
		@Inject( 'DevlogPostEdit' ) private editService: DevlogPostEdit,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() private feed: FeedComponent | undefined
	)
	{
		this.shareUrl = env.baseUrl + $state.href( 'discover.games.view.devlog.view', {
			slug: this.post.game.slug,
			id: this.post.game.id,
			postSlug: this.post.slug,
		} );
	}

	toggleComments()
	{
		// If we aren't in the feed, then don't toggle comments out.
		// We just scroll to the comments.
		this.scroll.to( 'comments' );

		this.isShowingComments = !this.isShowingComments;
		this.isShowingLikes = false;

		if ( this.onExpand ) {
			this.onExpand();
		}
	}

	toggleLikes()
	{
		this.isShowingLikes = !this.isShowingLikes;
		this.isShowingComments = false;

		if ( this.onExpand ) {
			this.onExpand();
		}

		if ( this.isShowingLikes ) {
			this.loadLikes();
		}
	}

	loadLikes()
	{
		this.post.fetchLikes()
			.then( ( likes ) =>
			{
				this.likes = likes;
				this.hasLoadedLikes = true;
			} );
	}

	copyShareUrl()
	{
		this.clipboard.copy( this.shareUrl );
	}

	showEdit()
	{
		this.editService.show( this.post )
			.then( ( post: Fireside_Post ) =>
			{
				if ( this.feed ) {
					this.feed.onPostEdited( post );
				}
			} );
	}

	publishPost()
	{
		this.post.$publish()
			.then( () =>
			{
				if ( this.feed ) {
					this.feed.onPostPublished( this.post );
				}
			} );
	}

	removePost()
	{
		this.post.remove()
			.then( () =>
			{
				if ( this.feed ) {
					this.feed.onPostRemoved( this.post );
				}
			} );
	}
}
