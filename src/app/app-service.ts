import { Injectable, Inject } from 'ng-metadata/core';

import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { User } from '../lib/gj-lib-client/components/user/user.model';
import { getProvider } from '../lib/gj-lib-client/utils/utils';
import { Screen } from '../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';
import { Scroll } from '../lib/gj-lib-client/components/scroll/scroll.service';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';

export function attachProvidersApp( $scope: ng.IScope )
{
	$scope['$state'] = getProvider<any>( '$state' );
	$scope['App'] = getProvider<any>( 'App' );
	$scope['Meta'] = Meta;
	$scope['Screen'] = Screen;
	$scope['Environment'] = Environment;
	$scope['Scroll'] = Scroll;
	$scope['Shell'] = getProvider<any>( 'Shell' );
	$scope['Connection'] = Connection;
}

@Injectable( 'App' )
export class App
{
	user: User | null = null;
	userBootstrapped = false;

	constructor(
		@Inject( '$rootScope' ) $rootScope: ng.IRootScopeService,
	)
	{
		// Payload emits this every time the user is processed.
		// We want to store whether or not we've bootstrapped the user yet so we can hide things
		// that depend on the user being loaded in.
		$rootScope.$on( 'Payload.userProcessed', () =>
		{
			if ( !this.userBootstrapped ) {
				this.userBootstrapped = true;
			}
		} );
	}

	get title() { return Meta.title; }
	set title( title: string | null ) { Meta.title = title; }
}
