import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from './edit.html';

@Injectable()
export class DevlogPostEdit
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
			controller: 'Devlog.Post.EditModalCtrl',
			controllerAs: '$ctrl',
			resolve: {
				post: () => post,
			},
		} );

		return modalInstance.result;
	}
}
