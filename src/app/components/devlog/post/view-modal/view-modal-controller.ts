import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class ModalCtrl
{
	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$modalInstance' ) private $modalInstance: any,
		@Inject( 'post' ) public post: Fireside_Post,
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
