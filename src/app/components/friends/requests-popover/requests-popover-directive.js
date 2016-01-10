angular.module( 'App.Friends.RequestsPopover' ).directive( 'gjFriendsRequestsPopover', function()
{
	var COUNT_INTERVAL = (5 * 60 * 1000);  // 5 minutes.

	return {
		restrict: 'E',
		templateUrl: '/app/components/friends/requests-popover/requests-popover.html',
		scope: {
			requestCount: '=?friendRequestCount',
			isShown: '=?',
		},
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope, $interval, App, User_Friendship, User_FriendshipsHelper, ModalConfirm, Growls, Popover )
		{
			var _this = this;

			$scope.App = App;

			this.activeTab = 'requests';
			this.requests = [];
			this.requestCount = undefined;
			this.pending = [];

			this.isShown = false;
			this.isLoading = true;

			this.onFocus = function()
			{
				this.isShown = true;
				this.fetchRequests();
			};

			this.onBlur = function()
			{
				this.isShown = false;
			};

			this.fetchCount = function()
			{
				User_Friendship.fetchCount().then( function( response )
				{
					_this.requestCount = response.requestCount;
				} );
			}

			this.fetchRequests = function()
			{
				User_Friendship.fetchRequests().then( function( response )
				{
					_this.requests = response.requests;
					_this.requestCount = _this.requests.length;
					_this.pending = response.pending;
					_this.isLoading = false;
				} );
			};

			this.setActiveTab = function( tab )
			{
				this.activeTab = tab;
			};

			this.acceptRequest = function( request )
			{
				User_FriendshipsHelper.acceptRequest( request ).then( function()
				{
					_.remove( _this.requests, { id: request.id } );
					_this.requestCount = _this.requests.length
				} );
			};

			this.rejectRequest = function( request )
			{
				User_FriendshipsHelper.rejectRequest( request ).then( function()
				{
					_.remove( _this.requests, { id: request.id } );
					_this.requestCount = _this.requests.length;
				} );
			};

			this.cancelRequest = function( request )
			{
				User_FriendshipsHelper.cancelRequest( request ).then( function()
				{
					_.remove( _this.pending, { id: request.id } );
				} );
			};

			// Fetch count right away.
			this.fetchCount();

			// Fetch counts every X minutes afterwards.
			var countInterval = $interval( function()
			{
				_this.fetchCount();
			}, COUNT_INTERVAL );

			$scope.$on( '$destroy', function()
			{
				$interval.cancel( countInterval );
			} );
		}
	};
} );
