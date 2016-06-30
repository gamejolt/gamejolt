import { Injectable, Inject } from 'ng-metadata/core';
import { Meta } from './../lib/gj-lib-client/components/meta/meta-service';

@Injectable()
export class App
{
	ver: number = null;
	user: any = null;
	shouldShowCoverImage = true;

	// We store these when they sign up so that we can log them in
	// once they authorize their account.
	credentials = {};

	constructor(
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( 'Meta' ) private meta: Meta,
		@Inject( 'Environment' ) private environment: any
	)
	{
		'ngNoInject';
	}

	get title() { return this.meta.title; }
	set title( title: string ) { this.meta.title = title; }

	redirectDashboard()
	{
		// This is mainly for client.
		// It tells the intro animation that it should play the intro even if it can't find a user.
		this.$window.sessionStorage.setItem( 'client-intro-login-play', 'play' );
		this.$window.location.href = this.environment.wttfBaseUrl + '/dashboard';
	}
}
