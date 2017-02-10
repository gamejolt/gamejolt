import { Injectable, Inject } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';

import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { ModalConfirm } from '../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { User } from '../lib/gj-lib-client/components/user/user.model';
import { Api } from '../lib/gj-lib-client/components/api/api.service';
import { getProvider } from '../lib/gj-lib-client/utils/utils';
import { Screen } from '../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';

export function attachProvidersApp( $scope: ng.IScope )
{
	$scope['$state'] = getProvider<any>( '$state' );
	$scope['App'] = getProvider<any>( 'App' );
	$scope['Meta'] = Meta;
	$scope['Screen'] = Screen;
	$scope['Environment'] = Environment;
	$scope['Scroll'] = getProvider<any>( 'Scroll' );
	$scope['Shell'] = getProvider<any>( 'Shell' );
	$scope['Connection'] = getProvider<any>( 'Connection' );
}

@Injectable( 'App' )
export class App
{
	user: User | null = null;
	userBootstrapped = false;

	constructor(
		@Inject( '$rootScope' ) $rootScope: ng.IRootScopeService,
		@Inject( '$state' ) private $state: StateService,
		@Inject( 'ModalConfirm' ) private modalConfirm: ModalConfirm,
		@Inject( 'Growls' ) private growls: any,
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

	async logout()
	{
		await this.modalConfirm.show( 'Are you seriously going to leave us?', 'Really?', 'yes' );

		// Must send POST.
		await Api.sendRequest( '/web/dash/account/logout', {} );

		// We go to the homepage currently just in case they're in a view they shouldn't be.
		this.$state.go( 'discover.home' );

		this.growls.success( 'You are now logged out.', 'Goodbye!' );
	}
}
