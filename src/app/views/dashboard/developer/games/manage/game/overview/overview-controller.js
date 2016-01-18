angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.OverviewCtrl', function( $scope, $state, App, ModalConfirm, Notification, Game, Growls, gettextCatalog, payload )
{
	var manageCtrl = $scope.manageCtrl;
	var game = manageCtrl.game;

	App.title = gettextCatalog.getString( 'dash.games.overview.page_title', { game: game.title } );

	this.viewCount = payload.viewCount || 0;
	this.downloadCount = payload.downloadCount || 0;
	this.playCount = payload.playCount || 0;
	this.followerCount = payload.followerCount || 0;
	this.commentCount = payload.commentCount || 0;
	this.mediaCount = payload.mediaCount || 0;
	this.newsCount = payload.newsCount || 0;
	this.songCount = payload.songCount || 0;

	this.hasActiveBuilds = payload.hasActiveBuilds || false;
	this.isPublishable = payload.isPublishable || false;
	this.hasGameApiIntegration = payload.hasGameApiIntegration || false;
	this.hasBuildsProcessing = payload.hasBuildsProcessing || false;

	this.notifications = payload.notifications ? Notification.populate( payload.notifications ) : [];

	this.todoItems = [
		{
			title: gettextCatalog.getString( 'dash.games.overview.todo_thumbnail_title' ),
			progressLabel: gettextCatalog.getString( 'dash.games.overview.todo_thumbnail_progress' ),
			level: 'required',
			status: !!game.thumbnail_media_item,
			percentage: 17,
			href: $state.href( '^.thumbnail' ),
		},
		{
			title: gettextCatalog.getString( 'dash.games.overview.todo_header_title' ),
			progressLabel: gettextCatalog.getString( 'dash.games.overview.todo_header_progress' ),
			level: 'recommended',
			status: !!game.header_media_item,
			percentage: 17,
			href: $state.href( '^.header' ),
		},
		{
			title: gettextCatalog.getString( 'dash.games.overview.todo_media_title' ),
			progressLabel: gettextCatalog.getString( 'dash.games.overview.todo_media_progress' ),
			level: 'recommended',
			status: this.mediaCount > 0,
			percentage: 17,
			href: $state.href( '^.^.media.list' ),
		},
		{
			title: gettextCatalog.getString( 'dash.games.overview.todo_maturity_title' ),
			progressLabel: gettextCatalog.getString( 'dash.games.overview.todo_maturity_progress' ),
			level: 'required',
			status: game.tigrs_age > 0,
			percentage: 17,
			href: $state.href( '^.maturity' ),
		},
		{
			title: gettextCatalog.getString( 'dash.games.overview.todo_builds_title' ),
			meta: game.development_status == Game.DEVELOPMENT_STATUS_WIP ? gettextCatalog.getString( 'dash.games.overview.todo_builds_extra_wip' ) : null,
			progressLabel: gettextCatalog.getString( 'dash.games.overview.todo_builds_progress' ),
			level: game.development_status != Game.DEVELOPMENT_STATUS_WIP ? 'required' : null,
			status: this.hasActiveBuilds,
			percentage: 17,
			href: $state.href( '^.^.packages' ),
		},

		// Additional todo items that show up after it's published.
		{
			title: gettextCatalog.getString( 'dash.games.overview.todo_songs_title' ),
			progressLabel: gettextCatalog.getString( 'dash.games.overview.todo_songs_progress' ),
			level: 'additional',
			status: this.songCount > 0,
			percentage: 5,
			href: $state.href( '^.^.music' ),
		},
		{
			title: gettextCatalog.getString( 'dash.games.overview.todo_news_title' ),
			progressLabel: gettextCatalog.getString( 'dash.games.overview.todo_news_progress' ),
			level: 'additional',
			status: this.newsCount > 0,
			percentage: 5,
			href: $state.href( '^.^.news.list' ),
		},
		{
			title: gettextCatalog.getString( 'dash.games.overview.todo_api_title' ),
			progressLabel: gettextCatalog.getString( 'dash.games.overview.todo_api_progress' ),
			level: 'additional',
			status: this.hasGameApiIntegration,
			percentage: 5,
			href: $state.href( '^.^.api.overview' ),
		},
	];

	this.todoPercentage = 0;
	this.todoItems.forEach( function( item )
	{
		if ( item.status && item.percentage ) {
			this.todoPercentage += item.percentage;
		}
	}, this );

	this.publish = function()
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.overview.publish_confirmation' ) )
			.then( function()
			{
				return game.$setStatus( Game.STATUS_VISIBLE );
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'dash.games.overview.published_growl' ),
					gettextCatalog.getString( 'dash.games.overview.published_growl_title' )
				);
			} );
	};

	// This is called if they loaded up the page and had builds in a processing state
	// but then the progress polling eventually found that they were all processed.
	// We just want to give the green light.
	this.onAllBuildsProcessed = function()
	{
		this.hasBuildsProcessing = false;
	};
} );
