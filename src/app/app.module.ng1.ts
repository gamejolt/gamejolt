import * as angular from 'angular';
import { StateService } from 'angular-ui-router';

import { bootstrapFacade } from '../lib/gj-lib-client/utils/angular-facade';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { Referrer } from '../lib/gj-lib-client/components/referrer/referrer.service';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { Translate } from '../lib/gj-lib-client/components/translate/translate.service';

import '../lib/gj-lib-client/components/filesize/filesize';
import '../lib/gj-lib-client/components/time/time';
import '../lib/gj-lib-client/components/duration/duration';
import '../lib/gj-lib-client/components/fuzzy-number/fuzzy-number';
import '../lib/gj-lib-client/components/currency/currency';
import '../lib/gj-lib-client/components/body-classes/body-classes';
import '../lib/gj-lib-client/components/loading/loading';
import '../lib/gj-lib-client/components/expand-when/expand-when.module';
import '../lib/gj-lib-client/components/ui-tree/placeholder/placeholder';
import '../lib/gj-lib-client/components/partial/partial';
import '../lib/gj-lib-client/components/tooltip/tooltip.module';
import '../lib/gj-lib-client/components/toggle-switch/toggle-switch';
import '../lib/gj-lib-client/components/scroll/parallax/parallax.module';
import '../lib/gj-lib-client/components/scroll/auto-scroll/auto-scroll';
import '../lib/gj-lib-client/components/scroll/fixed-resizer/fixed-resizer';
import '../lib/gj-lib-client/components/editable-accordion/editable-accordion';
import '../lib/gj-lib-client/components/progress/poller/poller.module';
import '../lib/gj-lib-client/components/alert/dismissable/dismissable';
import '../lib/gj-lib-client/components/activity/stream/stream-module';
import '../lib/gj-lib-client/components/form/form';
import '../lib/gj-lib-client/components/form/markdown-editor/markdown-editor';
import '../lib/gj-lib-client/components/form/upload-control/upload-control';
import '../lib/gj-lib-client/components/user/linked-accounts/linked-accounts';
import '../lib/gj-lib-client/components/user/message/message';
import '../lib/gj-lib-client/components/key-group/key-group';
import '../lib/gj-lib-client/components/game/news-article/news-article';
import '../lib/gj-lib-client/components/game/trophy/trophy';
import '../lib/gj-lib-client/components/game/data-store/item/item';
import '../lib/gj-lib-client/components/order/order';
import '../lib/gj-lib-client/components/order/item/item';
import '../lib/gj-lib-client/components/order/payment/payment';
import '../lib/gj-lib-client/components/order/payment/refund/refund';
import '../lib/gj-lib-client/components/order/address/address';
import '../lib/gj-lib-client/components/game/downloader/downloader';
import '../lib/gj-lib-client/components/game/key-pool/key-pool';
import '../lib/gj-lib-client/components/jam/jam-module';
import '../lib/gj-lib-client/components/jam/game/game';
import '../lib/gj-lib-client/components/jam/voting-category/voting-category';
import '../lib/gj-lib-client/components/jam/game/vote/vote';
import '../lib/gj-lib-client/components/jam/game/vote/widget/widget';
import '../lib/gj-lib-client/components/jam/award/award';
import '../lib/gj-lib-client/components/key/key-module';
import '../lib/gj-lib-client/components/linked-key/linked-key';
import '../lib/gj-lib-client/components/game-library/game/game';
import '../lib/gj-lib-client/components/user/game-score/game-score';
import '../lib/gj-lib-client/components/user/game-trophy/game-trophy';
import '../lib/gj-lib-client/components/user/game-session/game-session';
import '../lib/gj-lib-client/components/audio/player/player';
import '../lib/gj-lib-client/components/audio/scrubber/scrubber';
import '../lib/gj-lib-client/components/audio/playlist/playlist';
import '../lib/gj-lib-client/components/game/soundtrack/card/card';
import '../lib/gj-lib-client/components/img/crop/crop';

import './components/game-playlist/save-modal/save-modal-module';
import './components/invite/invite-module';
import './components/game/filtering/filtering-module';
import './components/game/cover-buttons/cover-buttons-module';
import './components/protocol-watcher/protocol-watcher-module';
import './components/score/feed/feed-module';
import './components/score/list/list-module';
import './components/score/overview/overview-module';
import './components/score/scoreboard-popover/scoreboard-popover-module';
import './components/sorting/sorting-module';
import './components/terms/change-alert/change-alert-module';
import './components/trophy/completion/completion-module';
import './components/trophy/list/list-module';
import './components/trophy/overview/overview-module';
import './components/trophy/thumbnail/thumbnail-module';
import './components/user/set-password-modal/set-password-modal-module';
import './components/user/token-modal/token-modal-module';

export const AppModuleNg1 = angular.module( 'App', [

	// Set the event tracking up first.
	// 'gj.ErrorTracking',

	// Client.
	/* inject client:modules */

	// Libs.
	'ngSanitize',
	'ngAnimate',

	'ui.bootstrap.collapse',
	'ui.bootstrap.modal',
	'ui.keypress',
	'validation.match',
	'ui.router.state.events',

	// GJ lib.
	'gj.Filesize',
	'gj.Time',
	'gj.Duration',
	'gj.FuzzyNumber',
	'gj.Currency',
	'gj.BodyClasses',
	'gj.Loading',
	'gj.ExpandWhen',
	'gj.UiTree.Placeholder',
	'gj.Partial',
	'gj.Backdrop',
	'gj.Tooltip',
	'gj.ToggleSwitch',
	'gj.Scroll.Parallax',
	'gj.Scroll.AutoScroll',
	'gj.Scroll.FixedResizer',
	'gj.EditableAccordion',
	'gj.Progress.Poller',
	'gj.Alert.Dismissable',
	'gj.Activity.Stream',
	'gj.Form',
	'gj.Form.MarkdownEditor',
	'gj.Form.UploadControl',
	'gj.User.LinkedAccounts',
	'gj.User.Message',
	'gj.KeyGroup',
	'gj.Game.NewsArticle',
	'gj.Game.Trophy',
	'gj.Game.DataStore.Item',
	'gj.Order',
	'gj.Order.Item',
	'gj.Order.Payment',
	'gj.Order.Payment.Refund',
	'gj.Order.Address',
	'gj.Game.Downloader',
	'gj.Game.KeyPool',
	'gj.Jam',
	'gj.Jam.Game',
	'gj.Jam.VotingCategory',
	'gj.Jam.Game.Vote',
	'gj.Jam.Game.Vote.Widget',
	'gj.Jam.Award',
	'gj.Key',
	'gj.LinkedKey',
	'gj.GameLibrary.Game',
	'gj.User.GameScore',
	'gj.User.GameTrophy',
	'gj.User.GameSession',
	'gj.Audio.Player',
	'gj.Audio.Scrubber',
	'gj.Audio.Playlist',
	'gj.Game.Soundtrack.Card',
	'gj.Img.Crop',

	// Components.
	'App.ProtocolWatcher',
	'App.Invite',
	'App.Sorting',
	'App.Game.Filtering',
	'App.Game.CoverButtons',
	'App.GamePlaylist.SaveModal',
	'App.Score.List',
	'App.Score.Feed',
	'App.Score.Overview',
	'App.Score.ScoreboardPopover',
	'App.Trophy.Thumbnail',
	'App.Trophy.List',
	'App.Trophy.Completion',
	'App.Trophy.Overview',
	'App.User.TokenModal',
	'App.User.SetPasswordModal',
	'App.User.FriendshipsHelper',
	'App.Terms.ChangeAlert',
] )
/*@ngInject*/
.config( (
	$locationProvider: ng.ILocationProvider,
	$uiViewScrollProvider: any,
	$compileProvider: ng.ICompileProvider,
	$sceDelegateProvider: ng.ISCEDelegateProvider,
	amTimeAgoConfig: any,
) =>
{
	$sceDelegateProvider.resourceUrlWhitelist( [
		'self',
		'https://s.gjcdn.net/**',
	] );

	$locationProvider.html5Mode( true ).hashPrefix( '!' );
	$uiViewScrollProvider.useAnchorScroll();

	amTimeAgoConfig.fullDateThreshold = 30;
	amTimeAgoConfig.fullDateFormat = 'll';

	// Desktop client.
	if ( GJ_IS_CLIENT ) {

		// // Some libraries attach onto global instead of window for node-webkit
		// // because they think they're in nodejs context. Just pull back over to window.
		// if ( typeof window._ == 'undefined' ) {
		// 	window._ = (<any>global)._;
		// }

		// Can't use push/popstate URLs for node-webkit.
		// Must be accessed like a local file with index.html at the root.
		$locationProvider.html5Mode( false );

		// Since we're using the "app://" protocol, we have to change the sanitization whitelist
		// to include the app protocol as well. Otherwise we get "unsafe:" prefixed onto certain URLs.
		$compileProvider.aHrefSanitizationWhitelist( /^\s*(https?|ftp|mailto|tel|file|app):/ );
		$compileProvider.imgSrcSanitizationWhitelist( /^\s*((https?|ftp|file|blob|app):|data:image\/)/ );
	}

	// Can't include in a foreach. Have to list out so that the revisioner for filenames will pull it.
	const languages = {
		main: {
			'en': require( '../translations/en/main.json' ),
			'en_US': require( '../translations/en_US/main.json' ),
			'en_AU': require( '../translations/en_AU/main.json' ),
			'nl': require( '../translations/nl/main.json' ),
			'ro': require( '../translations/ro/main.json' ),
			'de': require( '../translations/de/main.json' ),
			'es': require( '../translations/es/main.json' ),
			'fr': require( '../translations/fr/main.json' ),
			'ru': require( '../translations/ru/main.json' ),
			'sv': require( '../translations/sv/main.json' ),
			'tr': require( '../translations/tr/main.json' ),
			'pt': require( '../translations/pt/main.json' ),
			'pt_BR': require( '../translations/pt_BR/main.json' ),
			'fi': require( '../translations/fi/main.json' ),
			'nb': require( '../translations/nb/main.json' ),
			'el': require( '../translations/el/main.json' ),
			'ms': require( '../translations/ms/main.json' ),
			'pl': require( '../translations/pl/main.json' ),
			'uk': require( '../translations/uk/main.json' ),
			'it': require( '../translations/it/main.json' ),
			'bg': require( '../translations/bg/main.json' ),
			'cs': require( '../translations/cs/main.json' ),
			'es_419': require( '../translations/es_419/main.json' ),
			'es_AR': require( '../translations/es_AR/main.json' ),
			'es_CO': require( '../translations/es_CO/main.json' ),
			'es_MX': require( '../translations/es_MX/main.json' ),
			'hr': require( '../translations/hr/main.json' ),
			'id': require( '../translations/id/main.json' ),
			'zh_TW': require( '../translations/zh_TW/main.json' ),
		},
		dash: {
			'en': require( '../translations/en/dash.json' ),
			'en_US': require( '../translations/en_US/dash.json' ),
			'en_AU': require( '../translations/en_AU/dash.json' ),
			'nl': require( '../translations/nl/dash.json' ),
			'ro': require( '../translations/ro/dash.json' ),
			'de': require( '../translations/de/dash.json' ),
			'es': require( '../translations/es/dash.json' ),
			'fr': require( '../translations/fr/dash.json' ),
			'ru': require( '../translations/ru/dash.json' ),
			'sv': require( '../translations/sv/dash.json' ),
			'tr': require( '../translations/tr/dash.json' ),
			'pt': require( '../translations/pt/dash.json' ),
			'pt_BR': require( '../translations/pt_BR/dash.json' ),
			'fi': require( '../translations/fi/dash.json' ),
			'nb': require( '../translations/nb/dash.json' ),
			'el': require( '../translations/el/dash.json' ),
			'ms': require( '../translations/ms/dash.json' ),
			'pl': require( '../translations/pl/dash.json' ),
			'uk': require( '../translations/uk/dash.json' ),
			'it': require( '../translations/it/dash.json' ),
			'bg': require( '../translations/bg/dash.json' ),
			'cs': require( '../translations/cs/dash.json' ),
			'es_419': require( '../translations/es_419/dash.json' ),
			'es_AR': require( '../translations/es_AR/dash.json' ),
			'es_CO': require( '../translations/es_CO/dash.json' ),
			'es_MX': require( '../translations/es_MX/dash.json' ),
			'hr': require( '../translations/hr/dash.json' ),
			'id': require( '../translations/id/dash.json' ),
			'zh_TW': require( '../translations/zh_TW/dash.json' ),
		},
	};

	Translate.addLanguageUrls( languages );
} )
.run( (
	$q: ng.IQService,
	$animate: ng.animate.IAnimateService,
	$rootScope: ng.IRootScopeService,
	gettextCatalog: ng.gettext.gettextCatalog,
) =>
{
	bootstrapFacade( $q, $animate );
	gettextCatalog.setCurrentLanguage( Translate.lang );
	Analytics.initAngular( $rootScope );
	Meta.initAngular( $rootScope );
	Referrer.initAngular( $rootScope );
	Connection.initAngular( $rootScope );
} )
/**
 * angular-ui-router can't handle redirects between states yet.
 * This allows us to set a config on a state to redirect to another one.
 * This is really handy to redirect from a parent to child state.
 * Can remove once they close out: https://github.com/angular-ui/ui-router/issues/27
 */
/*@ngInject*/
.run( ( $rootScope: ng.IRootScopeService, $state: StateService ) =>
{
	$rootScope.$on( '$stateChangeStart', ( event, toState ) =>
	{
		const redirect = toState.redirectTo;
		if ( redirect ) {
			event.preventDefault();
			if ( typeof redirect === 'function' ) {
				redirect.call( $state );
			}
			else {
				$state.go( redirect );
			}
		}
	} );
} )
// Track time till Angular runs.
/*@ngInject*/
.run( () =>
{
	// Gotta wait for things to render out so we have an injector.
	window.setTimeout( () =>
	{
		const ms = Date.now() - window._gjStartTime;
		Analytics.trackTiming( 'shell', 'angular-start', ms );
	} );
} )
.name;
