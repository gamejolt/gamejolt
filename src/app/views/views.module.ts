import { NgModule } from 'ng-metadata/core';

import { importContext } from '../../lib/gj-lib-client/utils/utils';

angular.module( 'App.Views', [] );

@NgModule({
	imports: [
		'App.Views',
	],
})
export class ViewsModule { }

importContext( require.context( './', true, /\.state\.ts$/ ) );

// View partials.
importContext( require.context( '!ng-cache-loader?module=App.Views&prefix=src:/[dirs]!./', true, /\/_[^\/]*\.html$/ ) );

// Lazy loaded.
importContext( require.context( './dashboard', true, /\-state\.js$/ ) );
