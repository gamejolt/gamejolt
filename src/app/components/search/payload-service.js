angular.module( 'App.Search' ).factory( 'SearchPayload', function( $injector, Environment, User, Game )
{
	function SearchPayload( type, data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		this.type = type;
		this.users = User.populate( data.users );
		this.games = Game.populate( data.games );
		this.libraryGames = Environment.isClient && data.libraryGames ? $injector.get( 'LocalDb_Game' ).populate( data.libraryGames ) : [];
	}

	return SearchPayload;
} );
