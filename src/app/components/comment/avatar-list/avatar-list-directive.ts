import { Component, Inject, Input } from 'ng-metadata/core';
import { Comment } from './../../../../lib/gj-lib-client/components/comment/comment-model';
import template from 'html!./avatar-list.html';

@Component({
	selector: 'gj-comment-avatar-list',
	template,
})
export class AvatarListComponent
{
	@Input( '@commentResource' ) resource: string;
	@Input( '<commentResourceId' ) resourceId: number;

	comments: Comment[] = [];
	isFocused: { [k: number]: boolean } = {};

	constructor(
		@Inject( 'Comment' ) commentModel: typeof Comment,
	)
	{
		// Pull in new comments, huzzah!
		commentModel.fetch( this.resource, this.resourceId, 1 )
			.then( ( payload: any ) => this.comments = commentModel.populate( payload.comments ) );
	}

	onFocus( commentId: number )
	{
		this.isFocused[ commentId ] = true;
	}

	onBlur( commentId: number )
	{
		this.isFocused[ commentId ] = false;
	}
}
