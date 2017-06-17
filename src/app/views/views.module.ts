import * as angular from 'angular';
import { NgModule } from 'ng-metadata/core';

angular.module('App.Views', []);

import { importContext } from '../../lib/gj-lib-client/utils/utils';
import { DashboardViewsModule } from './dashboard/dashboard.module';

@NgModule({
	imports: ['App.Views', DashboardViewsModule],
})
export class ViewsModule {}

// importContext( require.context( './', true, /\.state\.ts$/ ) );

// View partials.
importContext(
	require.context(
		'!ng-cache-loader?module=App.Views&prefix=src:/[dirs]!./',
		true,
		/\/_[^\/]*\.html$/
	)
);

// require( './styleguide/styleguide-state.js' );
