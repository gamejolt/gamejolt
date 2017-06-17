import { Component, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./avatar-list.html';

import { Comment } from '../../../../lib/gj-lib-client/components/comment/comment-model';

@Component({
	selector: 'gj-comment-avatar-list',
	template,
})
export class AvatarListComponent {
	@Input('@commentResource') resource: string;
	@Input('<commentResourceId') resourceId: number;

	comments: Comment[] = [];
	isFocused: { [k: number]: boolean } = {};

	constructor() {
		// Pull in new comments, huzzah!
		Comment.fetch(this.resource, this.resourceId, 1).then(
			(payload: any) => (this.comments = Comment.populate(payload.comments))
		);
	}

	onFocus(commentId: number) {
		this.isFocused[commentId] = true;
	}

	onBlur(commentId: number) {
		this.isFocused[commentId] = false;
	}
}
