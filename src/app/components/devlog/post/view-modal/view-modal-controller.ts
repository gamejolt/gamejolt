import { Injectable, Inject } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable( 'ModalCtrl' )
export class ModalCtrl
{
	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$modalInstance' ) private $modalInstance: any,
		@Inject( 'post' ) public post: FiresidePost,
	)
	{
		$scope.$on( '$stateChangeStart', () =>
		{
			this.$modalInstance.dismiss();
		} );
	}

	close()
	{
		this.$modalInstance.dismiss();
	}
}
