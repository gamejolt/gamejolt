import { NgModule } from 'ng-metadata/core';
import * as angular from 'angular';

import { importContext } from '../lib/gj-lib-client/utils/utils';
import { FormsModule } from './components/forms/forms.module';

import { App } from './app-service';
import { AppComponent } from './app.component';

import { AppModuleNg1 } from './app.module.ng1';

import { ModelModule } from '../lib/gj-lib-client/components/model/model.module';
import { EnvironmentModule } from '../lib/gj-lib-client/components/environment/environment.module';
import { PopoverModule } from '../lib/gj-lib-client/components/popover/popover.module';
import { MediaItemModule } from '../lib/gj-lib-client/components/media-item/media-item.module';
import { ApiModule } from '../lib/gj-lib-client/components/api/api.module';
import { PayloadModule } from '../lib/gj-lib-client/components/payload/payload.module';
import { UserModule } from '../lib/gj-lib-client/components/user/user.module';
import { GameModule } from '../lib/gj-lib-client/components/game/game.module';
import { SellableModule } from '../lib/gj-lib-client/components/sellable/sellable.module';
import { SellablePricingModule } from '../lib/gj-lib-client/components/sellable/pricing/pricing.module';
import { RulerModule } from '../lib/gj-lib-client/components/ruler/ruler.module';
import { AnalyticsModule } from '../lib/gj-lib-client/components/analytics/analytics.module';
import { DeviceModule } from '../lib/gj-lib-client/components/device/device.module';
import ModalConfirmModule from '../lib/gj-lib-client/components/modal/confirm/confirm';
import { GamePackageModule } from '../lib/gj-lib-client/components/game/package/package.module';
import { GameReleaseModule } from '../lib/gj-lib-client/components/game/release/release.module';
import { GameBuildModule } from '../lib/gj-lib-client/components/game/build/build.module';
import { GameBuildFileModule } from '../lib/gj-lib-client/components/game/build/file/file.module';
import { GameBuildParamModule } from '../lib/gj-lib-client/components/game/build/param/param.module';
import { GameBuildLaunchOptionModule } from '../lib/gj-lib-client/components/game/build/launch-option/launch-option.module';
import GamePlayModalModule from '../lib/gj-lib-client/components/game/play-modal/play-modal';
import LoadModule from '../lib/gj-lib-client/components/load/load';
import { MetaModule } from '../lib/gj-lib-client/components/meta/meta.module';
import { ScreenModule } from '../lib/gj-lib-client/components/screen/screen.module';
import { ImgResponsiveModule } from '../lib/gj-lib-client/components/img/responsive/responsive.module';
import { ReferrerModule } from '../lib/gj-lib-client/components/referrer/referrer.module';
import { HistoryTickModule } from '../lib/gj-lib-client/components/history-tick/history-tick.module';
import { PartnerReferralModule } from '../lib/gj-lib-client/components/partner-referral/partner-referral.module';
import { GeoModule } from '../lib/gj-lib-client/components/geo/geo.module';
import { GamePackageCardModule } from '../lib/gj-lib-client/components/game/package/card/card.module';
import { CardModule } from '../lib/gj-lib-client/components/card/card.module';
import { GameThumbnailImgModule } from '../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img.module';
import { GameThumbnailModule } from '../app/components/game/thumbnail/thumbnail.module';
import { ScrollModule } from '../lib/gj-lib-client/components/scroll/scroll.module';
import { UserAvatarModule } from '../lib/gj-lib-client/components/user/user-avatar/user-avatar.module';
import { TranslateModule } from '../lib/gj-lib-client/components/translate/translate.module';
import { GrowlsModule } from '../lib/gj-lib-client/components/growls/growls.module';
import { AppFadeCollapse } from '../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { HistoryModule } from '../lib/gj-lib-client/components/history/history.module';

const ViewsModule = angular.module( 'App.Views', [] ).name;
importContext( require.context( './views', true, /\.state\.ts$/ ) );

@NgModule({
	imports: [
		require( '../lib/ui-router' ).default,
		require( 'oclazyload' ),

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
		DeviceModule,
		ImgResponsiveModule,
		PopoverModule,
		GameModule,
		GamePackageModule,
		GameReleaseModule,
		GameBuildModule,
		GameBuildFileModule,
		GameBuildParamModule,
		GameBuildLaunchOptionModule,
		MediaItemModule,
		UserModule,
		SellableModule,
		SellablePricingModule,
		ModalConfirmModule,
		HistoryTickModule,
		GamePlayModalModule,
		LoadModule,
		GameThumbnailModule,
		GameThumbnailImgModule,
		PartnerReferralModule,
		CardModule,
		ReferrerModule,
		GeoModule,
		GamePackageCardModule,
		ScrollModule,
		UserAvatarModule,
		TranslateModule,
		GrowlsModule,
		AppFadeCollapse,
		HistoryModule,
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
