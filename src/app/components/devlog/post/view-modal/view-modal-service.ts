import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from 'html!./view-modal.html';

@Injectable()
export class DevlogPostViewModal
{
	constructor(
		@Inject( '$modal' ) private $modal: any
	)
	{
	}

	show( post: Fireside_Post ): ng.IPromise<Fireside_Post>
	{
		const modalInstance = this.$modal.open( {
			template,
			controller: 'Devlog.Post.ViewModalCtrl',
			controllerAs: '$ctrl',
			resolve: {
				post: () => post,
			},
		} );

		return modalInstance.result;
	}
}
