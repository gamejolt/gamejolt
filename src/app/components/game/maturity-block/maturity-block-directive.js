angular.module( 'App.Game.MaturityBlock' ).component( 'gjGameMaturityBlock', {
	transclude: true,
	bindings: {
		game: '<',
	},
	template: require( '!html-loader!./maturity-block.html' ),
	controller: function( $scope, Scroll, App, Environment, Settings )
	{
		var _this = this;

		this.isLoaded = false;
		this.shouldProceed = !Settings.get( 'restricted-browsing' );

		if ( Environment.isPrerender ) {
			this.isLoaded = true;
			this.shouldProceed = true;
			return;
		}

		this.proceed = function()
		{
			this.shouldProceed = true;
			Scroll.to( 0, { animate: false } );
		};

		this.removeRestriction = function()
		{
			Settings.set( 'restricted-browsing', false );
			this.proceed();
		};

		$scope.$watch( '$ctrl.game.tigrs_age', function( val )
		{
			if ( angular.isDefined( val ) ) {
				_this.isLoaded = true;

				if ( App.user && App.user.id == _this.game.developer.id ) {
					_this.shouldProceed = true;
				}
			}
		} );
	}
} );
