angular.module( 'App.Game.Collection' ).factory( 'GameCollection', function( Model, Api, User )
{
	function GameCollection( data )
	{
		if ( data ) {
			angular.extend( this, data );

			// This is a fake ID that can be used in track by's and what not.
			if ( data.id && data.type ) {
				this._id = data.type + '-' + data.id;
			}

			if ( data.owner ) {
				this.owner = new User( data.owner );
			}
		}
	}

	GameCollection.TYPE_FOLLOWED = 'followed';
	GameCollection.TYPE_DEVELOPER = 'developer';
	GameCollection.TYPE_OWNED = 'owned';
	GameCollection.TYPE_RECOMMENDED = 'recommended';
	GameCollection.TYPE_PLAYLIST = 'playlist';
	GameCollection.TYPE_BUNDLE = 'bundle';
	GameCollection.TYPE_TAG = 'tag';

	GameCollection.USER_TYPES = [
		GameCollection.TYPE_FOLLOWED,
		GameCollection.TYPE_DEVELOPER,
		GameCollection.TYPE_OWNED,
		GameCollection.TYPE_RECOMMENDED,
	];

	GameCollection.prototype.getTitle = function()
	{
		var title = this.name;
		if ( this.from_subscription ) {
			title += ' - @' + this.owner.username;
		}
		return title;
	};

	GameCollection.prototype.getSref = function( includeParams )
	{
		var sref = 'library.collection.' + this.type;

		if ( includeParams ) {
			sref += '(' + angular.toJson( this.getSrefParams() ) + ')';
		}

		return sref;
	};

	GameCollection.prototype.getSrefParams = function()
	{
		var id = this.id;
		if ( id[0] == '@' ) {
			id = id.substring( 1 );
		}

		return {
			slug: this.slug,
			id: id,
		};
	};

	GameCollection.prototype.$follow = function()
	{
		return Api.sendRequest( '/web/library/follow/' + this.type, { id: this.id } );
	};

	GameCollection.prototype.$unfollow = function()
	{
		return Api.sendRequest( '/web/library/unfollow/' + this.type, { id: this.id } );
	};

	return Model.create( GameCollection );
} );
