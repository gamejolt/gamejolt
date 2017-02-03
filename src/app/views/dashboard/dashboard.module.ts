import { NgModule } from 'ng-metadata/core';
import { lazyBundle } from '../../../lib/gj-lib-client/utils/angular-facade';

import '../../../vendor/dash';

import { importContext } from '../../../lib/gj-lib-client/utils/utils';
import Developer from './developer/developer';
import Activity from './activity/activity';
import Analytics from './analytics/analytics';
import TimezoneModule from '../../../lib/gj-lib-client/components/timezone/timezone';
import ColorpickerModule from '../../../lib/gj-lib-client/components/colorpicker/colorpicker';
import ThemeEditorModule from '../../../lib/gj-lib-client/components/theme/theme-editor/theme-editor';
import ThemeSelectorModule from '../../../lib/gj-lib-client/components/theme/selector/selector';
import ContentBlockEditor from '../../../lib/gj-lib-client/components/content-block/editor/editor';
import SiteEditorModalModule from '../../components/site-editor-modal/site-editor-modal';
import { SiteModule } from '../../../lib/gj-lib-client/components/site/site.module';
import { SiteThemeModule } from '../../../lib/gj-lib-client/components/site/theme/theme.module';
import { SiteTemplateModule } from '../../../lib/gj-lib-client/components/site/template/template.module';
import { SiteBuildModule } from '../../../lib/gj-lib-client/components/site/build/build.module';
import { SiteContentBlockModule } from '../../../lib/gj-lib-client/components/site/content-block/content-block.module';
import { GraphModule } from '../../../lib/gj-lib-client/components/graph/graph.module';
import { FormsDashboardModule } from '../../components/forms/dashboard/dashboard.module';

import '../../../lib/gj-lib-client/components/date-helper/date-helper';
import '../../../lib/gj-lib-client/components/datetime-picker/datetime-picker';

angular.module( 'App.Views.Dashboard', [] );

@NgModule({
	imports: [
		'App.Views.Dashboard',

		'gj.DateHelper',
		'gj.DatetimePicker',

		SiteModule,
		SiteThemeModule,
		SiteTemplateModule,
		SiteContentBlockModule,
		SiteBuildModule,
		TimezoneModule,
		ColorpickerModule,
		ThemeEditorModule,
		ThemeSelectorModule,
		ContentBlockEditor,
		SiteEditorModalModule,
		GraphModule,

		// Views.
		Developer,
		Activity,
		Analytics,

		FormsDashboardModule,
	],
})
export class RouteModule { }

lazyBundle( RouteModule );

importContext( require.context( './', true, /\.state\.ts$/ ) );

// Old style views.
importContext( require.context( './', true, /\-(controller)\.js$/ ) );

// Directives for this section.
importContext( require.context( './', true, /\-(directive)\.js$/ ) );
