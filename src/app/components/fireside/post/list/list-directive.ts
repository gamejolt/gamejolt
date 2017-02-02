import { Component, Input } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import * as template from '!html-loader!./list.html';

@Component({
	selector: 'gj-fireside-post-list',
	template,
})
export class ListComponent
{
	@Input( '<firesidePosts' ) posts: FiresidePost[];

	noThumb: string = require( '../thumbnail/no-thumb.png' );
}
