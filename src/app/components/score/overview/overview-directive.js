angular.module( 'App.Score.Overview' ).directive( 'gjScoreOverview', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./overview.html' ),
		scope: {
			game: '=scoreOverviewGame',
			initialPayload: '=?scoreOverviewPayload',
			size: '@?scoreOverviewSize',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, Api, App, Screen, Game_ScoreTable, User_GameScore, Popover )
		{
			var _this = this;

			$scope.App = App;
			$scope.Screen = Screen;

			if ( !this.size ) {
				this.size = 'full';
			}

			this.processPayload = function( payload )
			{
				this.scoreTables = payload.scoreTables ? Game_ScoreTable.populate( payload.scoreTables ) : [];
				this.scoreTable = payload.scoreTable ? new Game_ScoreTable( payload.scoreTable ) : undefined;
				this.scores = payload.scores ? User_GameScore.populate( payload.scores ) : [];
				this.userBestScore = payload.scoresUserBestScore ? new User_GameScore( payload.scoresUserBestScore ) : undefined;
				this.userScorePlacement = payload.scoresUserScorePlacement || undefined;
				this.userScoreExperience = payload.scoresUserScoreExperience || undefined;

				this.scoresLeft = [];
				this.scoresRight = [];

				for ( var i = 0; i < this.scores.length; i ++ ) {
					if ( ( i + 2 ) % 2 == 0 ) {
						_this.scoresLeft.push( this.scores[i] );
					} else {
						_this.scoresRight.push( this.scores[i] );
					}
				}
			};

			this.changeTable = function( table )
			{
				Popover.hideAll();

				// Only if not current table.
				if ( table && table.id == this.scoreTable.id ) {
					return;
				}

				var url = '/web/discover/games/scores/overview/' + this.game.id;
				if ( table ) {
					url += '/' + table.id;
				}

				Api.sendRequest( url, null, { showLoadingBar: false } ).then( function( payload )
				{
					_this.processPayload( payload );
				} );
			};

			if ( this.initialPayload ) {
				this.processPayload( this.initialPayload );
			}
			else {
				this.changeTable();
			}
		}
	};
} );
