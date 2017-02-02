angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardEmailPreferences', function( Form, User, gettextCatalog )
{
	var form = new Form( {
		model: 'User',
		saveMethod: '$saveEmailPreferences',
		template: require( './email-preferences.html' )
	} );

	form.onInit = function( scope )
	{
		scope.notificationTypes = [
			{
				key: 'notify_comment_replies',
				label: gettextCatalog.getString( 'dash.email_prefs.notify_comment_replies_label' ),
				help: gettextCatalog.getString( 'dash.email_prefs.notify_comment_replies_help' ),
			},
			{
				key: 'notify_forum_posts',
				label: gettextCatalog.getString( 'dash.email_prefs.notify_forum_posts_label' ),
				help: gettextCatalog.getString( 'dash.email_prefs.notify_forum_posts_help' ),
			},
			{
				key: 'notify_followed_game_updates',
				label: gettextCatalog.getString( 'dash.email_prefs.notify_followed_game_updates_label' ),
				help: gettextCatalog.getString( 'dash.email_prefs.notify_followed_game_updates_help' ),
			},
			{
				key: 'notify_friendships',
				label: gettextCatalog.getString( 'dash.email_prefs.notify_friendships_label' ),
				help: gettextCatalog.getString( 'dash.email_prefs.notify_friendships_help' ),
			},
			{
				key: 'notify_private_messages',
				label: gettextCatalog.getString( 'dash.email_prefs.notify_private_messages_label' ),
				help: gettextCatalog.getString( 'dash.email_prefs.notify_private_messages_help' ),
			},
			{
				key: 'notify_comments',
				label: gettextCatalog.getString( 'dash.email_prefs.notify_comments_label' ),
				help: gettextCatalog.getString( 'dash.email_prefs.notify_comments_help' ),
			},
			{
				key: 'notify_ratings',
				label: gettextCatalog.getString( 'dash.email_prefs.notify_ratings_label' ),
				help: gettextCatalog.getString( 'dash.email_prefs.notify_ratings_help' ),
			},
			{
				key: 'notify_game_follows',
				label: gettextCatalog.getString( 'dash.email_prefs.notify_game_follows_label' ),
				help: gettextCatalog.getString( 'dash.email_prefs.notify_game_follows_help' ),
			},
			{
				key: 'notify_sales',
				label: gettextCatalog.getString( 'Sales' ),
				help: gettextCatalog.getString( 'Get emails when someone buys your games.' ),
			},
		];
	};

	return form;
} );
