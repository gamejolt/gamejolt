angular.module( 'App.Client.LocalDb' )
.config( function( LocalDbProvider )
{
	LocalDbProvider.registerTable( 1, 'games', 'id' );
} )
.factory( 'LocalDb_Game', function( $q, Model, LocalDb, LocalDb_Model, Game )
{
	function LocalDb_Game( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		this._game = new Game( data );
	}

	LocalDb_Game._table = 'games';

	LocalDb_Game.fromGame = function( game )
	{
		var gameData = _.pick( game, [
			'id',
			'title',
			'slug',
			'img_thumbnail',
			'header_media_item',
			'compatibility',
			'modified_on',
		] );

		gameData.developer = _.pick( game.developer, [
			'id',
			'username',
			'name',
			'display_name',
			'slug',
			'img_avatar',
		] );

		return new LocalDb_Game( gameData );
	};

	return LocalDb_Model.create( LocalDb_Game );
} );
