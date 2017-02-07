import { NgModule } from 'ng-metadata/core';

import { importContext } from '../../lib/gj-lib-client/utils/utils';

import { Discover } from './discover/discover.module';
import Profile from './profile/profile';
import Search from './search/search';

angular.module( 'App.Views', [] );

@NgModule({
	imports: [
		'App.Views',
		Profile,
		Discover,
		Search,
	],
})
export class ViewsModule { }

importContext( require.context( './', true, /\.state\.ts$/ ) );

// Old style views.
importContext( require.context( './discover', true, /\-(state|controller)\.js$/ ) );
importContext( require.context( './client', true, /\-(state|controller)\.js$/ ) );
importContext( require.context( './landing', true, /\-(state|controller)\.js$/ ) );
importContext( require.context( './legal', true, /\-(state|controller)\.js$/ ) );
importContext( require.context( './library', true, /\-(state|controller)\.js$/ ) );
importContext( require.context( './profile', true, /\-(state|controller)\.js$/ ) );
importContext( require.context( './search', true, /\-(state|controller)\.js$/ ) );
importContext( require.context( './settings', true, /\-(state|controller)\.js$/ ) );
importContext( require.context( './styleguide', true, /\-(state|controller)\.js$/ ) );

// View partials.
importContext( require.context( '!ng-cache-loader?module=App.Views&prefix=src:/[dirs]!./', true, /\/_[^\/]*\.html$/ ) );

// Lazy loaded.
importContext( require.context( './dashboard', true, /\-state\.js$/ ) );
importContext( require.context( './radio', true, /\-state\.js$/ ) );
importContext( require.context( './forums', true, /\-state\.js$/ ) );
