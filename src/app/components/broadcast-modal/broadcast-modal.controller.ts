import { Injectable } from 'ng-metadata/core';
import { Fireside_Post } from '../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';

@Injectable()
export class BroadcastModalCtrl
{
	post: Fireside_Post;
	posts: Fireside_Post[];

	screen: Screen;
	env: Environment;

	// DI doesn't work here...
	constructor(
		private $modalInstance: any,
		Fireside_Post: typeof Fireside_Post,
		Screen: Screen,
		Environment: Environment,
		posts: any[],
	)
	{
		this.screen = Screen;
		this.env = Environment;

		this.posts = Fireside_Post.populate( posts );

		if ( !this.screen.isXs ) {
			this.post = this.posts[0];
		}
	}

	close()
	{
		this.$modalInstance.dismiss();
	}
}
