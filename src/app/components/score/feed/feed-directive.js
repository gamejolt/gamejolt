angular.module( 'App.Score.Feed' ).directive( 'gjScoreFeed', function( $state, Activity_Stream )
{
	function processUser( user )
	{
		// #! gets added in Client/App but we never want it.
		user.url = $state.href( 'profile.overview', { username: user.username } ).replace( '#!', '' );

		var noAvatar = 'https://gamejolt.com/img/no-avatar-3.png';
		user.img_avatar = 'https://secure.gravatar.com/avatar/' + user.email_hash + '?s=200&r=pg&d=' + encodeURIComponent( noAvatar );
	}

	return {
		restrict: 'E',
		template: require( '!html-loader!./feed.html' ),
		scope: {
			scoreTable: '=scoreFeedScoreTable',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope )
		{
			var _this = this;

			var subscription, latestScore;
			this.scores = [];

			function setupSubscription()
			{
				subscription = Activity_Stream.subscribe( 'scores', { tableId: _this.scoreTable.id }, messageHandler );
			}

			function messageHandler( message )
			{
				if ( message.event && message.event == 'new-scores' ) {
					if ( message.scores && message.scores.length ) {

						var latestScoreDate = null;
						if ( latestScore ) {
							latestScoreDate = new Date( latestScore.time );
						}

						message.scores.forEach( function( score )
						{
							var scoreDate = new Date( score.time );

							if ( !latestScoreDate || scoreDate.getTime() > latestScoreDate.getTime() ) {
								latestScore = score;

								if ( score.user ) {
									processUser( score.user );
								}

								_this.scores.unshift( score );
							}
						} );

						_this.scores = _this.scores.slice( 0, 3 );
					}
				}
			}

			function closeSubscription()
			{
				if ( subscription ) {
					subscription.unsubscribe();
				}

				latestScore = null;
				subscription = null;

				_this.scores = [];
			}

			$scope.$watch( 'ctrl.scoreTable.id', function()
			{
				closeSubscription();
				setupSubscription();
			} );

			$scope.$on( '$destroy', function()
			{
				closeSubscription();
			} );
		}
	};
} );
