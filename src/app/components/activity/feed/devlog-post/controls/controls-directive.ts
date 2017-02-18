import { Component, Input, Output, Inject, OnInit, EventEmitter } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./controls.html';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FiresidePostLike } from '../../../../../../lib/gj-lib-client/components/fireside/post/like/like-model';
import { App } from '../../../../../app-service';
import { DevlogPostEdit } from '../../../../devlog/post/edit/edit-service';
import { Clipboard } from '../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';

@Component({
	selector: 'gj-activity-feed-devlog-post-controls',
	template,
})
export class ActivityFeedDevlogPostControlsComponent implements OnInit
{
	@Input( '<' ) post: FiresidePost;
	@Input( '<' ) showGameInfo = false;
	@Input( '<' ) showEditControls = false;
	@Input( '<' ) showExtraInfo = true;
	@Input( '<' ) requireTabs = false;
	@Input( '<' ) inModal = false;

	@Output() private onExpand = new EventEmitter<void>();
	@Output() private onPostEdit = new EventEmitter<void>();
	@Output() private onPostPublish = new EventEmitter<void>();
	@Output() private onPostRemove = new EventEmitter<void>();

	tab: 'comments' | 'likes' | undefined;
	hasLoadedLikes = false;
	likes: FiresidePostLike[] = [];

	isShowingShare = false;
	shareUrl: string;
	sharePopoverId: string;

	env = Environment;
	screen = Screen;
	firesidePostModel = FiresidePost;

	constructor(
		@Inject( '$state' ) $state: StateService,
		@Inject( 'App' ) public app: App,
		@Inject( 'DevlogPostEdit' ) private editService: DevlogPostEdit,
	)
	{
		this.shareUrl = Environment.baseUrl + $state.href( 'discover.games.view.devlog.view', {
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

		if ( this.tab === 'comments' && !this.requireTabs ) {
			this.tab = undefined;
		}
		else {
			this.tab = 'comments';
		}

		if ( this.onExpand ) {
			this.onExpand.emit( undefined );
		}
	}

	toggleLikes()
	{
		if ( this.tab === 'likes' && !this.requireTabs ) {
			this.tab = undefined;
		}
		else {
			this.tab = 'likes';
		}

		if ( this.onExpand ) {
			this.onExpand.emit( undefined );
		}

		if ( this.tab === 'likes' ) {
			this.loadLikes();
		}
	}

	async loadLikes()
	{
		const likes = await this.post.fetchLikes();
		this.likes = likes;
		this.hasLoadedLikes = true;
	}

	copyShareUrl()
	{
		Clipboard.copy( this.shareUrl );
	}

	async showEdit()
	{
		await this.editService.show( this.post );

		if ( this.onPostEdit ) {
			this.onPostEdit.emit( undefined );
		}
	}

	async publishPost()
	{
		await this.post.$publish();

		if ( this.onPostPublish ) {
			this.onPostPublish.emit( undefined );
		}
	}

	async removePost()
	{
		await this.post.remove();

		if ( this.onPostRemove ) {
			this.onPostRemove.emit( undefined );
		}
	}
}
