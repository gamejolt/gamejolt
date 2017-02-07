import { NgModule } from 'ng-metadata/core';

angular.module( 'App.Forms', [] );

require( './playlist/playlist-directive' );
require( './settings/settings-directive' );
require( './token/token-directive' );

@NgModule({
	imports: [
		'App.Forms',
	],
})
export class FormsModule { }
