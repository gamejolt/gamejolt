import { Injectable, Inject } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import * as template from '!html-loader!./view-modal.html';

@Injectable( 'DevlogPostViewModal' )
export class DevlogPostViewModal
{
	constructor(
		@Inject( '$modal' ) private $modal: any
	)
	{
	}

	show( post: FiresidePost ): Promise<FiresidePost>
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
