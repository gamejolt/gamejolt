import { NgModule } from 'ng-metadata/core';

import Game from './game/game';
import GameDescription from './game/description/description';
import GameDevlogPost from './game/devlog-post/devlog-post';
import GameDevStageSelector from './game/dev-stage-selector/dev-stage-selector';
import GameSketchfab from './game/sketchfab/sketchfab';
import Financials from './financials/financials';
import SiteBuild from './site/build/build';
import SiteSettings from './site/settings/settings';
import { importContext } from '../../../../lib/gj-lib-client/utils/utils';

angular.module( 'App.Forms.Dashboard', [] );

importContext( require.context( './', true, /\.js$/ ) );

@NgModule({
	imports: [
		'App.Forms.Dashboard',
		Game,
		GameDescription,
		GameDevlogPost,
		GameDevStageSelector,
		GameSketchfab,
		Financials,
		SiteBuild,
		SiteSettings,
	],
})
export class FormsDashboardModule { }
