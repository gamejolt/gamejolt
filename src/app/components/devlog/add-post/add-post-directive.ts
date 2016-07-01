import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { DevlogAddPostModal } from './modal-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from './add-post.html';

@Component({
	selector: 'gj-devlog-add-post',
	template,
})
export class AddPostComponent
{
	@Input( '<' ) game: any;
	@Output() onAdded: Function;

	constructor(
		@Inject( 'DevlogAddPostModal' ) private modal: DevlogAddPostModal
	)
	{
	}

	showAddModal( type: string )
	{
		this.modal.show( this.game, type )
			.then( ( post: Fireside_Post ) =>
			{
				if ( this.onAdded ) {
					this.onAdded( { $post: post } );
				}
			} );
	}
}
