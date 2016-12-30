import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';

@Injectable()
export class EditCtrl
{
	post: Fireside_Post;
	mediaItems: any;

	constructor(
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'Environment' ) public env: any,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'Fireside_Post' ) postModel: typeof Fireside_Post,
		@Inject( 'MediaItem' ) private mediaItemModel: any,
		@Inject( 'Api' ) private api: any,
		@Inject( 'ModalConfirm' ) private confirm: ModalConfirm,
		@Inject( 'payload' ) payload: any,
	)
	{
		this.post = new postModel( payload.post );

		meta.title = 'Edit ' + this.post.title;

		this.fetchMedia();
	}

	fetchMedia()
	{
		this.api.sendRequest( '/fireside/dash/posts/media/' + this.post.id )
			.then( ( payload: any ) =>
			{
				this.mediaItems = this.mediaItemModel.populate( payload.mediaItems );
			} );
	}

	onPostEdited()
	{
		this.growls.add( 'success', 'Post saved.' );
		this.scroll.to( 0 );
	}

	onHeaderChanged( item: any )
	{
		// Swap out the post header.
		this.post.header = item;
	}

	removePost()
	{
		this.confirm.show( 'Are you sure you want to remove this post?' )
			.then( () =>
			{
				this.post.$remove();
			} )
			.then( () =>
			{
				this.growls.add( 'success', 'The post has been removed from the site.' );
				this.$state.go( 'dashboard.main.fireside.posts.list' );
			} );
	}

	clearHeader()
	{
		this.confirm.show( 'Are you sure you want to clear this header image?' )
			.then( () =>
			{
				this.post.$clearHeader();
			} );
	}
}
