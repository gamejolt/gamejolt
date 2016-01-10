angular.module( 'App.Notifications.DescriptiveAction' ).directive( 'gjNotificationsDescriptiveAction', function( Notification )
{
	var translationMapping = {};
	translationMapping[ Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ] = 'new_comment_title_html';
	translationMapping[ Notification.TYPE_COMMENT_ADD ] = 'comment_reply_title_html';
	translationMapping[ Notification.TYPE_FORUM_POST_ADD ] = 'forum_post_title_html';
	translationMapping[ Notification.TYPE_FRIENDSHIP_REQUEST ] = 'friendship_request_title_html';
	translationMapping[ Notification.TYPE_FRIENDSHIP_ACCEPT ] = 'friendship_accepted_title_html';
	translationMapping[ Notification.TYPE_GAME_RATING_ADD ] = 'rating_title_html';
	translationMapping[ Notification.TYPE_GAME_FOLLOW ] = 'game_follow_title_html';
	translationMapping[ Notification.TYPE_GAME_NEWS_ADD ] = 'game_news_title_html';

	return {
		restrict: 'A',
		templateUrl: '/app/components/notifications/descriptive-action/descriptive-action.html',
		scope: {
			notification: '=gjNotificationsDescriptiveAction',
		},
		link: function( scope, element, attrs )
		{
			scope.Notification = Notification;
			scope.translationKey = 'notifications.' + translationMapping[ scope.notification.type ];

			// If this is a descriptive action in the popover, we do things a bit differently.
			var inPopover = false;
			if ( angular.isDefined( attrs.inPopover ) ) {
				inPopover = true;
			}

			if ( scope.notification.type == Notification.TYPE_GAME_RATING_ADD ) {
				if ( inPopover ) {
					scope.translationKey = 'notifications.rating_title_popover_html';
				}

				scope.translationValues = {
					rating: scope.notification.action_model.rating,
				};
			}
			else if ( scope.notification.type == Notification.TYPE_GAME_NEWS_ADD ) {
				if ( inPopover ) {
					scope.translationKey = 'notifications.game_news_title_popover_html';
				}

				scope.translationValues = {
					title: scope.notification.action_model.title,
				};
			}
			else {
				scope.translationValues = {
					object: scope.notification.object_model.title,
				};
			}
		}
	};
} );
