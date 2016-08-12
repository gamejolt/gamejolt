import { Component, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { SplitTest } from './../../split-test/split-test-service';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import template from 'html!./body.html';

@Component({
	selector: 'gj-shell-body',
	template,
	legacy: {
		transclude: true,
	},
})
export class BodyComponent
{
	shouldShowSideNav = false;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'App' ) public app: App,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'SplitTest' ) splitTest: SplitTest,
		@Inject( 'Analytics' ) analytics: any,
	)
	{
		$scope.$watchGroup( [
			'$ctrl.app.userBootstrapped',
			'!!$ctrl.app.user',
		],
		() =>
		{
			if ( app.userBootstrapped ) {
				if ( !app.user && splitTest.hasSideNav() ) {
					analytics.trackEvent( 'split-side-nav', 'shown' );
					this.shouldShowSideNav = true;
				}
				else {
					this.shouldShowSideNav = false;
					analytics.trackEvent( 'split-side-nav', 'not-shown' );
				}
			}
		} );
	}
}
