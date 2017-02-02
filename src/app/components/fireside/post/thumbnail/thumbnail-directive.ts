import { Component, Input } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import * as template from '!html-loader!./thumbnail.html';

@Component({
	selector: 'gj-fireside-post-thumbnail',
	template,
})
export class ThumbnailComponent
{
	@Input( '<firesidePost' ) post: FiresidePost;

	env = Environment;
	noThumb: string = require( './no-thumb.png' );
}
