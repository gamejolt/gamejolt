import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class ModalCtrl
{
	constructor(
		@Inject( '$modalInstance' ) private $modalInstance: any,
		@Inject( 'post' ) private post: Fireside_Post
	)
	{
	}

	onSubmitted( post: Fireside_Post )
	{
		this.$modalInstance.close( post );
	}

	close()
	{
		this.$modalInstance.dismiss();
	}
}
