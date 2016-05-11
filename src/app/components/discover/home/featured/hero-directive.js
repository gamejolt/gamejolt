angular.module( 'App.Views' ).component( 'gjDiscoverHomeFeaturedHero', {
	bindings: {
		item: '<',
	},
	templateUrl: '/app/components/discover/home/featured/hero.html',
	controller: function( $sce, Screen )
	{
		this.Screen = Screen;
		this.game = this.item.game;

		if ( this.game.has_animated_thumbnail ) {
			this.webm = $sce.trustAsResourceUrl( this.game.img_thumbnail_webm );
			this.mp4 = $sce.trustAsResourceUrl( this.game.img_thumbnail_mp4 );
		}
	},
} );
