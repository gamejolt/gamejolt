angular.module( 'App.Game.Cover.Buttons' ).directive( 'gjGameCoverButtons', function()
{
	return {
		restrict: 'E',
		scope: {
			game: '=gjGame',
			packages: '=gjGamePackages',
			onShowPackages: '&onShowPackages',
			hasButtons: '=hasButtons',
			variation: '=variation',
		},
		templateUrl: '/app/components/game/cover/buttons/buttons.html',
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope, Game, Device, Game_Downloader, Game_PlayModal, Analytics )
		{
			var _this = this;

			var os = Device.os();
			var arch = Device.arch();

			this.installableBuilds = [];
			this.browserBuilds = [];

			$scope.$watch( 'ctrl.packages', function( packages )
			{
				if ( !packages || !packages.length ) {
					return;
				}

				_this.installableBuilds = Game.pluckInstallableBuilds( packages, os, arch );
				_this.browserBuilds = Game.pluckBrowserBuilds( packages );

				if ( _this.installableBuilds.length || _this.browserBuilds.length ) {
					_this.hasButtons = true;
				}
			} );

			this.play = function()
			{
				if ( this.browserBuilds.length > 1 ) {

					// All builds in same package, so choose the best one.
					if ( _.uniq( _.pluck( this.browserBuilds, 'game_package_id' ) ).length <= 1 ) {

						// Prioritize HTML build.
						var htmlBuild = _.where( this.browserBuilds, { type_html: 1 } );
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
