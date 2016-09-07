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

	GameCollection.prototype.getTitle = function()
	{
		var title = this.name;
		if ( this.from_subscription ) {
			title += ' - ' + this.owner.display_name;
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
		return {
			slug: this.slug,
			id: this.id,
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
