angular.module( 'App.Notifications.DescriptiveAction' ).directive( 'gjNotificationsDescriptiveAction', function( Notification, gettext, gettextCatalog, currencyFilter )
{
	var translationKeys = {};
	translationKeys[ Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ] = gettext( 'notifications.new_comment_title_html' );
	translationKeys[ Notification.TYPE_COMMENT_ADD ] = gettext( 'notifications.comment_reply_title_html' );
	translationKeys[ Notification.TYPE_FORUM_POST_ADD ] = gettext( 'notifications.forum_post_title_html' );
	translationKeys[ Notification.TYPE_FRIENDSHIP_REQUEST ] = gettext( 'notifications.friendship_request_title_html' );
	translationKeys[ Notification.TYPE_FRIENDSHIP_ACCEPT ] = gettext( 'notifications.friendship_accepted_title_html' );
	translationKeys[ Notification.TYPE_GAME_RATING_ADD ] = gettext( 'notifications.rating_title_html' );
	translationKeys[ Notification.TYPE_GAME_FOLLOW ] = gettext( 'notifications.game_follow_title_html' );
	translationKeys[ Notification.TYPE_GAME_NEWS_ADD ] = gettext( 'notifications.game_news_title_html' );
	translationKeys[ Notification.TYPE_SELLABLE_SELL ] = gettext( 'bought a package in <strong>{{ object }}</strong> for <strong>{{ amount }}</strong>.' );

	return {
		restrict: 'A',
		templateUrl: '/app/components/notifications/descriptive-action/descriptive-action.html',
		scope: {
			notification: '=gjNotificationsDescriptiveAction',
		},
		link: function( scope, element, attrs )
		{
			scope.Notification = Notification;
			var translationKey = translationKeys[ scope.notification.type ];
			var translationValues = null;

			// If this is a descriptive action in the popover, we do things a bit differently.
			var inPopover = false;
			if ( angular.isDefined( attrs.inPopover ) ) {
				inPopover = true;
			}

			if ( scope.notification.type == Notification.TYPE_GAME_RATING_ADD ) {
				if ( inPopover ) {
					translationKey = gettext( 'notifications.rating_title_popover_html' );
				}

				translationValues = {
					rating: scope.notification.action_model.rating,
				};
			}
			else if ( scope.notification.type == Notification.TYPE_GAME_NEWS_ADD ) {
				if ( inPopover ) {
					translationKey = gettext( 'notifications.game_news_title_popover_html' );
				}

				translationValues = {
					title: scope.notification.action_model.title,
				};
			}
			else if ( scope.notification.type == Notification.TYPE_SELLABLE_SELL ) {
				translationValues = {
					object: scope.notification.object_model.title,
					amount: currencyFilter( scope.notification.action_model.amount / 100, '$' ),
				};
			}
			else {
				translationValues = {
					object: scope.notification.object_model.title,
				};
			}

			scope.getAction = function()
			{
				return gettextCatalog.getString( translationKey, translationValues );
			};
		}
	};
} );
