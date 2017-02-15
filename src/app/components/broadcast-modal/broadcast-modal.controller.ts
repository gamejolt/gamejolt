import { Injectable } from 'ng-metadata/core';
import { FiresidePost } from '../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';

@Injectable( 'BroadcastModalCtrl' )
export class BroadcastModalCtrl
{
	post: FiresidePost;
	posts: FiresidePost[];

	screen: Screen;
	env: Environment;

	/*@ngInject*/
	constructor(
		private $modalInstance: any,
		Fireside_Post: typeof Fireside_Post,
		posts: any[],
	)
	{
		this.screen = Screen;
		this.env = Environment;

		this.posts = Fireside_Post.populate( posts );

		if ( !Screen.isXs ) {
			this.post = this.posts[0];
		}
	}

	close()
	{
		this.$modalInstance.dismiss();
	}
}
