angular.module( 'App.Game.Cover.Buttons' ).directive( 'gjGameCoverButtons', function()
{
	return {
		restrict: 'E',
		scope: {
			game: '=',
			installableBuilds: '=',
			browserBuilds: '=',
			onShowPackages: '&',
		},
		templateUrl: '/app/components/game/cover/buttons/buttons.html',
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope, Game, Device, Game_Downloader, Game_PlayModal, Game_Build, Analytics, Environment )
		{
			var _this = this;

			$scope.Environment = Environment;

			var os = Device.os();
			var arch = Device.arch();

			this.isGamePatching = undefined;
			this.hasLocalPackage = false;

			this.play = function()
			{
				if ( this.browserBuilds.length > 1 ) {

					// All builds in same package, so choose the best one.
					if ( _.uniq( _.pluck( this.browserBuilds, 'game_package_id' ) ).length <= 1 ) {

						// Prioritize HTML build.
						var htmlBuild = _.find( this.browserBuilds, { type: Game_Build.TYPE_HTML } );
						if ( htmlBuild ) {
							this.browserBuilds = [ htmlBuild ];
						}
						// Otherwise we just fall through below and choose first.
					}
					else {
						this.onShowPackages();
						return;
					}
				}

				Analytics.trackEvent( 'game-cover-buttons', 'download', 'play' );

				var build = this.browserBuilds[0];
				Game_PlayModal.show( this.game, build );
			};

			this.download = function()
			{
				if ( this.installableBuilds.length > 1 ) {

					// All builds in same package, so choose the best one.
					if ( _.uniq( _.pluck( this.installableBuilds, 'game_package_id' ) ).length <= 1 ) {
						this.installableBuilds = [ Game.chooseBestBuild( this.installableBuilds, os, arch ) ];
					}
					else {
						this.onShowPackages();
						return;
					}
				}

				Analytics.trackEvent( 'game-cover-buttons', 'download', 'download' );

				var build = this.installableBuilds[0];
				Game_Downloader.download( this.game, build );
			};
		}
	};
} );
