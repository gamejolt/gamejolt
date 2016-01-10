angular.module( 'App', [
	// Set the event tracking up first.
	'gj.ErrorTracking',

	// Libs.
	'ngSanitize',
	'ngAnimate',
	'ui.router',
	'oc.lazyLoad',

	'ui.bootstrap.collapse',
	'angularMoment',
	'cfp.hotkeys',
	'ui.bootstrap.modal',
	'ui.keypress',
	'validation.match',

	// GJ lib.
	'gj.Translate',
	'gj.Environment',
	'gj.Api',
	'gj.Payload',
	'gj.Model',
	'gj.Error',
	'gj.Meta',

	'gj.Filesize',
	'gj.Time',
	'gj.Duration',
	'gj.FuzzyNumber',
	'gj.Fuzzysearch',

	'gj.Debug',
	'gj.Debug.DebugBar',
	'gj.Ruler',
	'gj.Screen',
	'gj.BodyClasses',
	'gj.Analytics',
	'gj.Loading',
	'gj.Loading.LoadingPageTransition',
	'gj.Scroll',
	'gj.Typography',
	'gj.ExpandWhen',
	'gj.UiTree.Placeholder',
	'gj.Device',
	'gj.Location',
	'gj.Connection',
	'gj.Connection.StatePermissions',

	'gj.Backdrop',
	'gj.Tooltip',
	'gj.Popover',
	'gj.ToggleSwitch',
	'gj.Growls',
	'gj.Scroll.Parallax',
	'gj.Scroll.Affix',
	'gj.Scroll.AutoScroll',
	'gj.Scroll.FixedResizer',
	'gj.EditableAccordion',
	'gj.HistoryTick',
	'gj.Pagination',
	'gj.Modal.Confirm',
	'gj.SiteSelector',
	'gj.Favicon',
	'gj.FadeCollapse',
	'gj.Progress.Poller',

	'gj.Primus',
	'gj.Activity.Stream',

	'gj.Graph',
	'gj.Graph.Table',
	'gj.Graph.Widget',

	'gj.Form',
	'gj.Form.MarkdownEditor',
	'gj.Form.UploadControl',

	'gj.User',
	'gj.User.UserAvatar',
	'gj.User.LinkedAccounts',
	'gj.User.Friendship',
	'gj.User.Message',
	'gj.Notification',
	'gj.Comment',
	'gj.Comment.Vote',
	'gj.Comment.Widget',
	'gj.Subscription',
	'gj.Ad',
	'gj.Ad.Video',
	'gj.MediaItem',

	'gj.Game',
	'gj.Game.Rating',
	'gj.Game.Screenshot',
	'gj.Game.Video',
	'gj.Game.Song',
	'gj.Game.Package',
	'gj.Game.Release',
	'gj.Game.Build',
	'gj.Game.Build.File',
	'gj.Game.Build.Param',
	'gj.Game.Build.LaunchOption',
	'gj.Game.NewsArticle',
	'gj.Game.Trophy',
	'gj.Game.ScoreTable',
	'gj.Game.DataStore.Item',

	'gj.Game.Package.Card',
	'gj.Game.PlayModal',

	'gj.Jam',
	'gj.Jam.Game',
	'gj.Jam.VotingCategory',
	'gj.Jam.Game.Vote',
	'gj.Jam.Game.Vote.Widget',
	'gj.Jam.Award',

	'gj.Chat.Room',

	'gj.Social.Twitter.Sdk',
	'gj.Social.Twitter.Share',
	'gj.Social.Twitter.Follow',
	'gj.Social.Facebook.Sdk',
	'gj.Social.Facebook.Like',
	'gj.Social.Facebook.Share',
	'gj.Social.Facebook.Send',

	'gj.GameLibrary.Game',

	'gj.User.GameScore',
	'gj.User.GameTrophy',
	'gj.User.GameSession',

	'gj.Audio.Player',
	'gj.Audio.Scrubber',
	'gj.Audio.Playlist',
	'gj.Game.Soundtrack.Card',

	'gj.GamePlaylist',
	'gj.GamePlaylist.Game',

	'gj.GameBundle',

	'gj.Fireside.Post',
	'gj.Fireside.Post.Tag',

	'gj.Forum.Topic',
	'gj.Forum.Post',

	'gj.Img.Helper',
	'gj.Img.Crop',
	'gj.Img.ImgResponsive',

	// Components.
	'App.SplitTest',
	'App.Chat',
	'App.Shell',
	'App.Offline.Alert',
	'App.Search',
	'App.Friends',
	'App.Notifications',
	'App.Minbar',
	'App.Invite',
	'App.Sorting',

	'App.Forms',

	'App.FeaturedItem',

	'App.Activity.Feed',
	'App.Notifications.DescriptiveAction',

	'App.Genre.List',

	'App.Fireside.Post.Thumbnail',
	'App.Fireside.Post.List',

	'App.Post.Grid',
	'App.Post.List',

	'App.Game.Thumbnail',
	'App.Meter',
	'App.Game.CompatIcons',
	'App.Game.Grid',
	'App.Game.Filtering',
	'App.Game.Cover',
	'App.Game.MediaBar',
	'App.Game.Ogrs',
	'App.Game.RatingGrowl',
	'App.Game.Video.Embed',
	'App.Game.ViewState',

	'App.Game.Collection',
	'App.Game.Collection.Thumbnail',
	'App.Game.Collection.Grid',
	'App.Game.Collection.List',

	'App.Rating.Widget',

	'App.GamePlaylist.SaveModal',
	'App.GamePlaylist.AddToPopover',

	'App.Score.List',
	'App.Score.Feed',
	'App.Score.Overview',
	'App.Score.ScoreboardPopover',

	'App.Trophy.Thumbnail',
	'App.Trophy.List',
	'App.Trophy.Completion',
	'App.Trophy.Overview',

	'App.User.LevelWidget',
	'App.User.TokenModal',
	'App.User.SetPasswordModal',
	'App.User.FriendshipsHelper',

	// Views.
	'App.Views',

	// Client.
	/* inject client:modules */
] )
.config( function( $locationProvider, $uiViewScrollProvider, $compileProvider, $httpProvider, EnvironmentProvider, $ocLazyLoadProvider, $sceDelegateProvider, amTimeAgoConfig )
{
	$sceDelegateProvider.resourceUrlWhitelist( [
		'self',
		'https://b6d3e9q9.ssl.hwcdn.net/**',
	] );

	$locationProvider.html5Mode( true ).hashPrefix( '!' );
	$uiViewScrollProvider.useAnchorScroll();

	$compileProvider.debugInfoEnabled( false );
	$httpProvider.useApplyAsync( true );

	$ocLazyLoadProvider.config( {
		loadedModules: [ 'App' ]  // Hardcoded so it doesn't have to search DOM for it.
	} );

	amTimeAgoConfig.fullDateThreshold = 30;
	amTimeAgoConfig.fullDateFormat = 'll';

	// We are on WTTF!
	EnvironmentProvider.isWttf = true;

	// Desktop client.
	if ( EnvironmentProvider.isClient ) {

		// Some libraries attach onto global instead of window for node-webkit
		// because they think they're in nodejs context. Just pull back over to window.
		if ( typeof window._ == 'undefined' ) {
			window._ = global._;
		}

		if ( typeof window.moment == 'undefined' ) {
			window.moment = global.moment;
		}

		// Can't use push/popstate URLs for node-webkit.
		// Must be accessed like a local file with index.html at the root.
		$locationProvider.html5Mode( false );

		// Since we're using the "app://" protocol, we have to change the sanitization whitelist
		// to include the app protocol as well. Otherwise we get "unsafe:" prefixed onto certain URLs.
		$compileProvider.aHrefSanitizationWhitelist( /^\s*(https?|ftp|mailto|tel|file|app):/ );
		$compileProvider.imgSrcSanitizationWhitelist( /^\s*((https?|ftp|file|blob|app):|data:image\/)/ );
	}
} )
/**
 * angular-ui-router can't handle redirects between states yet.
 * This allows us to set a config on a state to redirect to another one.
 * This is really handy to redirect from a parent to child state.
 * Can remove once they close out: https://github.com/angular-ui/ui-router/issues/27
 */
.run( function( $rootScope, $state )
{
	$rootScope.$on( '$stateChangeStart', function( event, toState )
	{
		var redirect = toState.redirectTo;
		if ( redirect ) {
			event.preventDefault();
			if ( angular.isFunction( redirect ) ) {
				redirect.call( $state );
			}
			else {
				$state.go( redirect );
			}
		}
	} );
} )
// Track time till Angular runs.
.run( function( Analytics )
{
	var ms = Date.now() - window._gjStartTime;
	Analytics.trackTiming( 'shell', 'angular-start', ms );
} )
;

// For lazy loading.
// TODO: Move this into a component!
// TODO: Clean it up and get it working for more modules.
// angular.module( 'App' ).config( function( $futureStateProvider )
// {
// 	$futureStateProvider.stateFactory( 'lazy', [ '$ocLazyLoad', 'futureState', function( $ocLazyLoad, futureState )
// 	{
// 		// I have no clue why, but for some reason it was failing without the .then().
// 		return $ocLazyLoad.load( futureState.src ).then( angular.noop );
// 	} ] );

// 	$futureStateProvider.addResolve( [ '$http', function( $http )
// 	{
// 		return $http.get( '/app/modules/dash.json' ).then( function( response )
// 		{
// 			angular.forEach( response.data, function( futureState )
// 			{
// 				futureState.type = 'lazy';
// 				futureState.src = [ '/app/modules/dash.js' ];
// 				futureState.url = futureState.url || '';

// 				$futureStateProvider.futureState( futureState );
// 			} );
// 		} );
// 	} ] );
// } );
