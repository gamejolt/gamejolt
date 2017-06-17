import { Injectable, Inject } from 'ng-metadata/core';
import { GamesCtrl } from './games-controller';

interface Scope extends ng.IScope {
	$ctrl: GamesCtrl;
}

@Injectable()
export class FetchCtrl {
	constructor(
		@Inject('$scope') $scope: Scope,
		@Inject('payload') payload: any,
	) {
		$scope.$ctrl.listing.processPayload(payload);
	}
}
