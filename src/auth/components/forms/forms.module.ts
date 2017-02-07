import { NgModule } from 'ng-metadata/core';

angular.module( 'App.Forms', [] );

require( './join/join-directive' );
require( './reset-password/reset-password-directive' );
require( './retrieve-login/retrieve-login-directive' );

@NgModule({
	imports: [
		'App.Forms',
	],
})
export class FormsModule { }
