angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardEmailPreferences', function( $translate, Form, User )
{
	var form = new Form( {
		model: 'User',
		saveMethod: '$saveEmailPreferences',
		template: '/app/components/forms/dashboard/email-preferences/email-preferences.html'
	} );

	form.onInit = function( scope )
	{
		scope.notificationTypes = [
			{
				key: 'notify_comment_replies',
			},
			{
				key: 'notify_forum_posts',
			},
			{
				key: 'notify_followed_game_updates',
			},
			{
				key: 'notify_friendships',
			},
			{
				key: 'notify_private_messages',
			},
			{
				key: 'notify_comments',
			},
			{
				key: 'notify_ratings',
			},
			{
				key: 'notify_game_follows',
			},
		];

		var keys = _( scope.notificationTypes )
			.map( function( item )
			{
				return [
					'dash.email_prefs.' + item.key + '_label',
					'dash.email_prefs.' + item.key + '_help',
				];
			} )
			.flatten()
			.value();

		$translate( keys ).then( function( translations )
		{
			for ( var i = 0; i < scope.notificationTypes.length; ++i ) {
				var item = scope.notificationTypes[i];
				var key = 'dash.email_prefs.' + item.key;
				item.label = translations[ key + '_label' ];

				if ( translations[ key + '_help' ] != key + '_help' ) {
					item.help = translations[ key + '_help' ];
				}
			}
		} );
	};

	return form;
} );
