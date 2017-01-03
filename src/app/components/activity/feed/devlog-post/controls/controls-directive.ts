import { Component, Input, Output, Inject, OnInit } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Fireside_Post_Like } from './../../../../../../lib/gj-lib-client/components/fireside/post/like/like-model';
import { App } from './../../../../../app-service';
import { DevlogPostEdit } from './../../../../devlog/post/edit/edit-service';
import { Clipboard } from './../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { Screen } from './../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import template from 'html!./controls.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-controls',
	template,
})
export class ControlsComponent implements OnInit
{
	@Input( '<' ) post: Fireside_Post;
	@Input( '<?' ) showGameInfo = false;
	@Input( '<?' ) showEditControls = false;
	@Input( '<?' ) showExtraInfo = true;
	@Input( '<?' ) requireTabs = false;
	@Input( '<?' ) inModal = false;

	@Output( '?' ) onExpand?: Function;
	@Output( '?' ) onPostEdit?: Function;
	@Output( '?' ) onPostPublish?: Function;
	@Output( '?' ) onPostRemove?: Function;

	tab: 'comments' | 'likes' | undefined;
	hasLoadedLikes = false;
	likes: Fireside_Post_Like[] = [];

	isShowingShare = false;
	shareUrl: string;
	sharePopoverId: string;

	constructor(
		@Inject( '$state' ) $state: ng.ui.IStateService,
		@Inject( 'App' ) public app: App,
		@Inject( 'Environment' ) public env: Environment,
		@Inject( 'Clipboard' ) private clipboard: Clipboard,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'Fireside_Post' ) public firesidePostModel: typeof Fireside_Post,
		@Inject( 'DevlogPostEdit' ) private editService: DevlogPostEdit,
	)
	{
		this.shareUrl = env.baseUrl + $state.href( 'discover.games.view.devlog.view', {
			slug: this.post.game.slug,
			id: this.post.game.id,
			postSlug: this.post.slug,
		} );
	}

	ngOnInit()
	{
		if ( this.requireTabs ) {
			this.tab = 'comments';
		}

		this.sharePopoverId = `activity-feed-devlog-post-share-${ this.inModal ? 'modal' : 'no-modal' }-${ this.post.id }`;
	}

	toggleComments()
	{
		// If we aren't in the feed, then don't toggle comments out.
		// We just scroll to the comments.
		// this.scroll.to( 'comments' );

		if ( this.tab == 'comments' && !this.requireTabs ) {
			this.tab = undefined;
		}
		else {
			this.tab = 'comments';
		}

		if ( this.onExpand ) {
			this.onExpand();
		}
	}

	toggleLikes()
	{
		if ( this.tab == 'likes' && !this.requireTabs ) {
			this.tab = undefined;
		}
		else {
			this.tab = 'likes';
		}

		if ( this.onExpand ) {
			this.onExpand();
		}

		if ( this.tab == 'likes' ) {
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
			.then( () =>
			{
				if ( this.onPostEdit ) {
					this.onPostEdit();
				}
			} );
	}

	publishPost()
	{
		this.post.$publish()
			.then( () =>
			{
				if ( this.onPostPublish ) {
					this.onPostPublish();
				}
			} );
	}

	removePost()
	{
		this.post.remove()
			.then( () =>
			{
				if ( this.onPostRemove ) {
					this.onPostRemove( this.post );
				}
			} );
	}
}
