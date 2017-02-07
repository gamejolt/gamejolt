import { Component, Input } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import * as template from '!html-loader!./view.html';

@Component({
	selector: 'gj-devlog-post-view',
	template,
})
export class ViewComponent
{
	@Input( '<' ) post: FiresidePost;
	@Input( '<' ) showGameInfo = false;
	@Input( '<' ) inModal = false;

	constructor(
	)
	{
	}
}
