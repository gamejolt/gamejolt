angular.module( 'App.Game.Cover.Buttons' ).component( 'gjGameCoverButtons', {
	bindings: {
		game: '<',
		packages: '<',
		installableBuilds: '<',
		browserBuilds: '<',
		onShowMultiplePackages: '&',
		onShowPackagePayment: '&',
	},
	templateUrl: '/app/components/game/cover/buttons/buttons.html',
	controller: function( Game, Device, Game_Downloader, Game_PlayModal, Game_Build, Analytics, Environment )
	{
		var _this = this;

		this.Environment = Environment;

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
			Analytics.trackEvent( 'game-cover-buttons', 'download', 'download' );

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

			var build = this.installableBuilds[0];

			// If the build belongs to a pwyw package, open up the package
			// payment form.
			if ( build._package.shouldShowNamePrice() ) {
				this.onShowPackagePayment( { $package: build._package } );
				return;
			}

			Game_Downloader.download( this.game, build );
		};

		this.buy = function()
		{
			// We pull the primary package for this game.
			// It's basically the package that has its sellable
			// as the game's primary sellable.
			var package = _.find( this.packages, {
				_sellable: {
					id: this.game.sellable.id,
				}
			} );

			this.onShowPackagePayment( { $package: package } );
		};
	}
} );
