import { NgModule } from 'ng-metadata/core';

import { FormsModule } from './components/forms/forms.module';
import { ViewsModule } from './views/views.module';

import { App } from './app-service';
import { AppComponent } from './app.component';

import { AppModuleNg1 } from './app.module.ng1';

import { ModelModule } from '../lib/gj-lib-client/components/model/model.module';
import ScreenModule from '../lib/gj-lib-client/components/screen/screen';
import { EnvironmentModule } from '../lib/gj-lib-client/components/environment/environment.module';
import ImgHelperModule from '../lib/gj-lib-client/components/img/helper/helper';
import { PopoverModule } from '../lib/gj-lib-client/components/popover/popover.module';
import { MediaItemModule } from '../lib/gj-lib-client/components/media-item/media-item.module';
import { ApiModule } from '../lib/gj-lib-client/components/api/api.module';
import { PayloadModule } from '../lib/gj-lib-client/components/payload/payload.module';
import { UserModule } from '../lib/gj-lib-client/components/user/user.module';
import { GameModule } from '../lib/gj-lib-client/components/game/game.module';
import ImgResponsiveModule from '../lib/gj-lib-client/components/img/responsive/responsive';
import { SellableModule } from '../lib/gj-lib-client/components/sellable/sellable.module';
import { SellablePricingModule } from '../lib/gj-lib-client/components/sellable/pricing/pricing.module';
import { RulerModule } from '../lib/gj-lib-client/components/ruler/ruler.module';
import { AnalyticsModule } from '../lib/gj-lib-client/components/analytics/analytics.module';
import { MetaModule } from '../lib/gj-lib-client/components/meta/meta.module';

@NgModule({
	imports: [
		require( '../lib/ui-router' ).default,

		FormsModule,
		ViewsModule,

		EnvironmentModule,
		ApiModule,
		PayloadModule,
		ModelModule,
		AnalyticsModule,
		MetaModule,
		RulerModule,
		ScreenModule,
		ImgHelperModule,
		ImgResponsiveModule,
		PopoverModule,
		GameModule,
		MediaItemModule,
		UserModule,
		SellableModule,
		SellablePricingModule,
		AppModuleNg1,
	],
	declarations: [
		AppComponent,
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
