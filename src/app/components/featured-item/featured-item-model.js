angular.module( 'App.FeaturedItem' ).factory( 'FeaturedItem', function( Model, Game )
{
	function FeaturedItem( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.game ) {
			this.game = new Game( this.game );
		}
	}

	return Model.create( FeaturedItem );
} );
