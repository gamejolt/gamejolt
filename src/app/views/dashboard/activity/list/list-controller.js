angular.module( 'App.Views' ).controller( 'Dashboard.Activity.ListCtrl', function( $scope, $state, $stateParams, $translate, Translate, Notification, ModalConfirm, payload )
{
	var _this = this;

	Translate.pageTitle( 'dash.activity.page_title' );

	$scope.Notification = Notification;

	this.tab = $stateParams.tab;
	this.filter = $stateParams.filter;
	this.page = $stateParams.page || 1;

	this.notifications = Notification.populate( payload.notifications );
	this.notificationsCount = payload.notificationsCount || 0;
	this.unreadCounts = payload.unreadCounts || {};
	this.unreadCounts[ undefined ] = _.sum( this.unreadCounts ) || null;

	this.notificationTypes = [
		{
			key: undefined,
			translationKey: 'all_label',
		},
		{
			key: Notification.TYPE_GAME_NEWS_ADD,
			translationKey: 'game_news_label',
		},
		{
			key: Notification.TYPE_COMMENT_ADD,
			translationKey: 'comment_replies_label',
		},
		{
			key: Notification.TYPE_FORUM_POST_ADD,
			translationKey: 'forum_posts_label',
		},
		{
			key: Notification.TYPE_FRIENDSHIP_ACCEPT,
			translationKey: 'new_friends_label',
		},
		{
			key: Notification.TYPE_COMMENT_ADD_OBJECT_OWNER,
			translationKey: 'new_comments_label',
		},
		{
			key: Notification.TYPE_GAME_RATING_ADD,
			translationKey: 'game_ratings_label',
		},
		{
			key: Notification.TYPE_GAME_FOLLOW,
			translationKey: 'game_follows_label',
		},
	];

	this.currentNotificationType = _.find( this.notificationTypes, { key: this.filter } );

	this.filterNotifications = function()
	{
		var wrapped = _( this.notifications );

		if ( $stateParams.filter ) {
			wrapped = wrapped.filter( { type: $stateParams.filter } );
		}

		if ( $stateParams.tab == 'unread' ) {
			wrapped = wrapped.filter( function( item )
			{
				return !item.viewed_on;
			} );
		}

		this.filteredNotifications = wrapped.value();
	};

	this.filterNotifications();

	this.markAllRead = function()
	{
		var translateKey = 'notifications.clear_all_confirmation';
		if ( this.currentNotificationType.key ) {
			translateKey = 'notifications.clear_all_of_type_confirmation';
		}

		ModalConfirm.show( $translate.instant( translateKey ) )
			.then( function()
			{
				return Notification.$readAll( _this.currentNotificationType.key );
			} )
			.then( function()
			{
				$state.reload( $state.current );
			} );
	};
} );
