import Developer from './developer/developer';
import Activity from './activity/activity';
import Analytics from './analytics/analytics';
import FormsModule from './../../components/forms/dashboard/dashboard';
import SiteModule from '../../../lib/gj-lib-client/components/site/site';
import SiteThemeModule from '../../../lib/gj-lib-client/components/site/theme/theme';
import SiteTemplateModule from '../../../lib/gj-lib-client/components/site/template/template';
import SiteContentBlockModule from '../../../lib/gj-lib-client/components/site/content-block/content-block';
import TimezoneModule from '../../../lib/gj-lib-client/components/timezone/timezone';
import ColorpickerModule from '../../../lib/gj-lib-client/components/colorpicker/colorpicker';
import ThemeEditorModule from '../../../lib/gj-lib-client/components/theme/theme-editor/theme-editor';
import ThemeSelectorModule from '../../../lib/gj-lib-client/components/theme/selector/selector';
import ContentBlockEditor from '../../../lib/gj-lib-client/components/content-block/editor/editor';
import SiteEditorModalModule from '../../components/site-editor-modal/site-editor-modal';

angular.module( 'App.Views.Dashboard', [
	'gj.DateHelper',
	'gj.DatetimePicker',
	'ngTimezone',

	Developer,
	Activity,
	Analytics,
	FormsModule,
	SiteModule,
	SiteThemeModule,
	SiteTemplateModule,
	SiteContentBlockModule,
	TimezoneModule,
	ColorpickerModule,
	ThemeEditorModule,
	ThemeSelectorModule,
	ContentBlockEditor,
	SiteEditorModalModule,
] );
