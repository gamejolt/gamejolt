import { NgModule } from 'ng-metadata/core';

import { FormsModule } from './components/forms/forms.module';
import { ViewsModule } from './views/views.module';

import { App } from './app-service';
import { AppComponent } from './app.component';

import { AppModuleNg1 } from './app.module.ng1';

import ConnectionModule from '../lib/gj-lib-client/components/connection/connection';
import { ModelModule } from '../lib/gj-lib-client/components/model/model.module';
import MetaModule from '../lib/gj-lib-client/components/meta/meta';
import ScreenModule from '../lib/gj-lib-client/components/screen/screen';
import { EnvironmentModule } from '../lib/gj-lib-client/components/environment/environment.module';
import ImgHelperModule from '../lib/gj-lib-client/components/img/helper/helper';
import AuthModule from '../lib/gj-lib-client/components/auth/auth';
import AuthJoinModule from '../lib/gj-lib-client/components/auth/join/join';
import AuthLoginModule from '../lib/gj-lib-client/components/auth/login/login';
import { PopoverModule } from '../lib/gj-lib-client/components/popover/popover.module';
import { MediaItemModule } from '../lib/gj-lib-client/components/media-item/media-item.module';
import { ApiModule } from '../lib/gj-lib-client/components/api/api.module';
import { PayloadModule } from '../lib/gj-lib-client/components/payload/payload.module';
import { UserModule } from '../lib/gj-lib-client/components/user/user.module';
import { CoverImgComponent } from './components/cover-img/cover-img.component';
import { RulerModule } from '../lib/gj-lib-client/components/ruler/ruler.module';
import { AnalyticsModule } from '../lib/gj-lib-client/components/analytics/analytics.module';

@NgModule({
	imports: [
		require( 'angular-ui-router' ).default,

		FormsModule,
		ViewsModule,

		EnvironmentModule,
		ApiModule,
		PayloadModule,
		ModelModule,
		AnalyticsModule,
		PopoverModule,
		MediaItemModule,
		MetaModule,
		RulerModule,
		ScreenModule,
		ConnectionModule,
		ImgHelperModule,
		AuthModule,
		AuthJoinModule,
		AuthLoginModule,
		UserModule,
		AppModuleNg1,
	],
	declarations: [
		AppComponent,
		CoverImgComponent,
	],
	providers: [
		App,
	],
	bootstrap: [
		AppComponent,
	],
})
export class AppModule
{
}
