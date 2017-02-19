import { NgModule } from 'ng-metadata/core';

import { FormsModule } from './components/forms/forms.module';
import { ViewsModule } from './views/views.module';

import { App } from './app-service';
import { AppComponent } from './app.component';

import { AppModuleNg1 } from './app.module.ng1';

import ConnectionModule from '../lib/gj-lib-client/components/connection/connection';
import ConnectionStatePermissionsModule from '../lib/gj-lib-client/components/connection/state-permissions/state-permissions';
import { ModelModule } from '../lib/gj-lib-client/components/model/model.module';
import LoadModule from '../lib/gj-lib-client/components/load/load';
import LocationModule from '../lib/gj-lib-client/components/location/location';
import PaginationModule from '../lib/gj-lib-client/components/pagination/pagination';
import ModalConfirmModule from '../lib/gj-lib-client/components/modal/confirm/confirm';
import { EnvironmentModule } from '../lib/gj-lib-client/components/environment/environment.module';
import { NotificationModule as gjNotificationModule } from '../lib/gj-lib-client/components/notification/notification.module';
import { CommentModule } from '../lib/gj-lib-client/components/comment/comment.module';
import { CommentVoteModule } from '../lib/gj-lib-client/components/comment/vote/vote.module';
import { CommentVideoModule } from '../lib/gj-lib-client/components/comment/video/video.module';
import GamePlayModalModule from '../lib/gj-lib-client/components/game/play-modal/play-modal';
import YoutubeSdkModule from '../lib/gj-lib-client/components/social/youtube/sdk/sdk';
import YoutubeSubscribeModule from '../lib/gj-lib-client/components/social/youtube/subscribe/subscribe';
import { YoutubeChannelModule } from '../lib/gj-lib-client/components/youtube/channel/channel.module';
import CommentVideoLightboxModule from '../lib/gj-lib-client/components/comment/video/lightbox/lightbox';
import CommentVideoThumbnailModule from '../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import ResponsiveDimensionsModule from '../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';
import VideoModule from '../lib/gj-lib-client/components/video/video';
import { FiresidePostModule } from '../lib/gj-lib-client/components/fireside/post/post.module';
import { FiresidePostTagModule } from '../lib/gj-lib-client/components/fireside/post/tag/tag.module';
import { FiresidePostVideoModule } from '../lib/gj-lib-client/components/fireside/post/video/video.module';
import { FiresidePostSketchfabModule } from '../lib/gj-lib-client/components/fireside/post/sketchfab/sketchfab.module';
import { FiresidePostLikeModule } from '../lib/gj-lib-client/components/fireside/post/like/like.module';
import FiresidePostLikeWidgetModule from '../lib/gj-lib-client/components/fireside/post/like/widget/widget';
import AuthModule from '../lib/gj-lib-client/components/auth/auth';
import AuthJoinModule from '../lib/gj-lib-client/components/auth/join/join';
import BroadcastModalModule from './components/broadcast-modal/broadcast-modal';
import SplitTestModule from './components/split-test/split-test';
import ShellModule from './components/shell/shell';
import { SearchModule } from './components/search/search.module';
import FriendModule from './components/friend/friend';
import NotificationModule from './components/notification/notification';
import MediaItemCoverModule from './components/media-item/cover/cover';
import PageHeaderModule from './components/page-header/page-header';
import GenreListModule from './components/genre/list/list';
import CommentAvatarListModule from './components/comment/avatar-list/avatar-list';
import GameListingModule from './components/game/listing/listing';
import ChannelsModule from './components/channel/channels';
import ChannelThumbnailModule from './components/channel/thumbnail/thumbnail';
import DevlogPostAddModule from './components/devlog/post/add/add';
import DevlogPostEditModule from './components/devlog/post/edit/edit';
import DevlogPostMediaModule from './components/devlog/post/media/media';
import DevlogPostViewModule from './components/devlog/post/view/view';
import DevlogPostViewModalModule from './components/devlog/post/view-modal/view-modal';
import GameThumbnailModule from './components/game/thumbnail/thumbnail';
import GameFollowWidgetModule from './components/game/follow-widget/follow-widget';
import GameGridModule from './components/game/grid/grid';
import FiresidePostThumbnailModule from './components/fireside/post/thumbnail/thumbnail';
import FiresidePostListModule from './components/fireside/post/list/list';
import GameModLinksModule from './components/game/mod-links/mod-links';
import CountdownModule from '../lib/gj-lib-client/components/countdown/countdown';
import LoadingFadeModule from '../lib/gj-lib-client/components/loading/fade/fade';
import { GameSketchfabModule } from '../lib/gj-lib-client/components/game/sketchfab/sketchfab.module';
import { PopoverModule } from '../lib/gj-lib-client/components/popover/popover.module';
import { MediaItemModule } from '../lib/gj-lib-client/components/media-item/media-item.module';
import { ApiModule } from '../lib/gj-lib-client/components/api/api.module';
import { GameModule } from '../lib/gj-lib-client/components/game/game.module';
import { GameBuildModule } from '../lib/gj-lib-client/components/game/build/build.module';
import { GameBuildFileModule } from '../lib/gj-lib-client/components/game/build/file/file.module';
import { GameBuildLaunchOptionModule } from '../lib/gj-lib-client/components/game/build/launch-option/launch-option.module';
import { GameBuildParamModule } from '../lib/gj-lib-client/components/game/build/param/param.module';
import { GameReleaseModule } from '../lib/gj-lib-client/components/game/release/release.module';
import { GamePackageModule } from '../lib/gj-lib-client/components/game/package/package.module';
import { SellableModule } from '../lib/gj-lib-client/components/sellable/sellable.module';
import { SellablePricingModule } from '../lib/gj-lib-client/components/sellable/pricing/pricing.module';
import { PayloadModule } from '../lib/gj-lib-client/components/payload/payload.module';
import { UserModule } from '../lib/gj-lib-client/components/user/user.module';
import { DeviceModule } from '../lib/gj-lib-client/components/device/device.module';
import { PrimusModule } from '../lib/gj-lib-client/components/primus/primus.module';
import { ActivityModule } from './components/activity/activity.module';
import { MediaBarModule } from '../lib/gj-lib-client/components/media-bar/media-bar.module';
import { RegistryModule } from '../lib/gj-lib-client/components/registry/registry.module';
import { RulerModule } from '../lib/gj-lib-client/components/ruler/ruler.module';
import { AnalyticsModule } from '../lib/gj-lib-client/components/analytics/analytics.module';
import { AdModule } from '../lib/gj-lib-client/components/ad/ad.module';
import { MetaModule } from '../lib/gj-lib-client/components/meta/meta.module';
import { ScreenModule } from '../lib/gj-lib-client/components/screen/screen.module';
import { ImgResponsiveModule } from '../lib/gj-lib-client/components/img/responsive/responsive';
import { VideoEmbedModule } from '../lib/gj-lib-client/components/video/embed/embed.module';
import { SketchfabEmbedModule } from '../lib/gj-lib-client/components/sketchfab/embed/embed.module';
import { GameScreenshotModule } from '../lib/gj-lib-client/components/game/screenshot/screenshot.module';
import { GameVideoModule } from '../lib/gj-lib-client/components/game/video/video.module';
import { ReferrerModule } from '../lib/gj-lib-client/components/referrer/referrer.module';
import { HistoryTickModule } from '../lib/gj-lib-client/components/history-tick/history-tick.module';
import { PartnerReferralModule } from '../lib/gj-lib-client/components/partner-referral/partner-referral.module';
import { GeoModule } from '../lib/gj-lib-client/components/geo/geo.module';
import { WidgetCompilerModule } from '../lib/gj-lib-client/components/widget-compiler/widget-compiler.module';
import { GamePackageCardModule } from '../lib/gj-lib-client/components/game/package/card/card.module';
import { NavTabListModule } from '../lib/gj-lib-client/components/nav/tab-list/tab-list.module';
import { SettingsModule } from './components/settings/settings.module';
import { ClipboardModule } from '../lib/gj-lib-client/components/clipboard/clipboard.module';
import { CardModule } from '../lib/gj-lib-client/components/card/card.module';
import { GameThumbnailImgModule } from '../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img.module';

@NgModule({
	imports: [
		require( '../lib/ui-router' ).default,
		require( 'angular-moment' ),
		require( 'oclazyload' ),
		require( 'angular-inview' ).name,

		EnvironmentModule,
		ApiModule,
		PayloadModule,
		ModelModule,
		AnalyticsModule,
		RegistryModule,
		PopoverModule,
		SearchModule,
		FormsModule,
		ViewsModule,
		CommentModule,
		CommentVoteModule,
		CommentVideoModule,
		gjNotificationModule,
		YoutubeChannelModule,
		FiresidePostModule,
		FiresidePostTagModule,
		FiresidePostVideoModule,
		FiresidePostSketchfabModule,
		FiresidePostLikeModule,
		GameSketchfabModule,
		MediaItemModule,
		MetaModule,
		ConnectionStatePermissionsModule,
		RulerModule,
		ScreenModule,
		LoadModule,
		DeviceModule,
		LocationModule,
		ConnectionModule,
		ClipboardModule,
		CardModule,
		HistoryTickModule,
		PaginationModule,
		ModalConfirmModule,
		CommentVideoThumbnailModule,
		CommentVideoLightboxModule,
		GameThumbnailImgModule,
		GamePlayModalModule,
		YoutubeSdkModule,
		YoutubeSubscribeModule,
		FiresidePostLikeWidgetModule,
		ImgResponsiveModule,
		ResponsiveDimensionsModule,
		WidgetCompilerModule,
		VideoModule,
		VideoEmbedModule,
		SketchfabEmbedModule,
		PartnerReferralModule,
		AuthModule,
		AuthJoinModule,
		SplitTestModule,
		ShellModule,
		FriendModule,
		ActivityModule,
		NotificationModule,
		MediaItemCoverModule,
		PageHeaderModule,
		GameListingModule,
		GenreListModule,
		DevlogPostAddModule,
		DevlogPostEditModule,
		DevlogPostMediaModule,
		DevlogPostViewModule,
		DevlogPostViewModalModule,
		FiresidePostListModule,
		FiresidePostThumbnailModule,
		GameThumbnailModule,
		GameFollowWidgetModule,
		GameGridModule,
		MediaBarModule,
		CommentAvatarListModule,
		ChannelsModule,
		ChannelThumbnailModule,
		GameModLinksModule,
		CountdownModule,
		LoadingFadeModule,
		BroadcastModalModule,
		UserModule,
		GameModule,
		GameScreenshotModule,
		GameVideoModule,
		GameBuildModule,
		GameBuildFileModule,
		GameBuildLaunchOptionModule,
		GameBuildParamModule,
		GameReleaseModule,
		GamePackageModule,
		SellableModule,
		SellablePricingModule,
		PrimusModule,
		ReferrerModule,
		GeoModule,
		AdModule,
		GamePackageCardModule,
		NavTabListModule,
		SettingsModule,
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
