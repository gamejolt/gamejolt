import { Injectable, Inject } from 'ng-metadata/core';
import { DevlogsCtrl } from './devlogs-controller';

interface Scope extends ng.IScope {
	$ctrl: DevlogsCtrl;
}

@Injectable()
export class FetchCtrl
{
	constructor(
		@Inject( '$scope' ) $scope: Scope,
		@Inject( 'payload' ) payload: any,
	)
	{
		$scope.$ctrl.listing.processPayload( payload );
	}
}
