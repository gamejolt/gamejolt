angular.module( 'App.Chat' ).factory( 'Chat_UserCollection', function( $injector, ChatConfig )
{
	function Chat_UserCollection( type, users )
	{
		this.type = type;
		this.collection = [];
		this.onlineCount = 0;
		this.offlineCount = 0;

		if ( users && users.length ) {
			for ( var i = 0; i < users.length; ++i ) {
				var user = users[ i ];

				if ( user.isOnline ) {
					++this.onlineCount;
				}
				else {
					++this.offlineCount;
				}

				setTrackId( user );
				this.collection.push( user );
			}
		}

		this.sort();
	}

	Chat_UserCollection.TYPE_FRIEND = 'friend';
	Chat_UserCollection.TYPE_ROOM = 'room';

	function setTrackId( user )
	{
		// Update their track by field so that user lists know that they've changed.
		user._trackId = user.id + ':' + Date.now();

		// If we have any chat tabs for this user, we need to update the user on the room
		// object as well. Otherwise it won't update when user info changes.
		var Chat = $injector.get( 'Chat' );
		if ( Chat.client.openRooms[ user.roomId ] ) {
			Chat.client.openRooms[ user.roomId ].user = user;
		}
	}

	Chat_UserCollection.prototype.get = function( input )
	{
		var userId = typeof input === 'number' ? input : input.id;
		return _.find( this.collection, { id: userId } );
	};

	Chat_UserCollection.prototype.getByRoom = function( input )
	{
		var roomId = typeof input === 'number' ? input : input.id;
		return _.find( this.collection, { roomId: roomId } );
	};

	Chat_UserCollection.prototype.has = function( input )
	{
		return !!this.get( input );
	};

	// Sadly, not only does angular need us to change the track by,
	// but it also check on object equality to see if anything has changed
	// in the array it ng-repeats on.
	Chat_UserCollection.prototype._touch = function( user )
	{
		var newUser = angular.copy( user );
		setTrackId( newUser );
		var index = _.findIndex( this.collection, { id: user.id } );
		if ( index !== -1 ) {
			this.collection[ index ] = newUser;
		}
	};

	Chat_UserCollection.prototype.touch = function( input )
	{
		var user = this.get( input );
		if ( user ) {
			this._touch( user );
		}
	};

	Chat_UserCollection.prototype.touchRoom = function( input )
	{
		var user = this.getByRoom( input );
		if ( user ) {
			this._touch( user );
		}
	};

	Chat_UserCollection.prototype.touchAll = function()
	{
		for ( var i = 0; i < this.collection.length; ++i ) {
			this._touch( this.collection[ i ] );
		}
	};

	Chat_UserCollection.prototype.add = function( user )
	{
		// Don't add the same user again.
		if ( this.has( user ) ) {
			return;
		}

		setTrackId( user );

		if ( user.isOnline ) {
			++this.onlineCount;
		}
		else if ( user.isOnline ) {
			++this.offlineCount;
		}

		this.collection.push( user );
		this.sort();
	};

	Chat_UserCollection.prototype.remove = function( input )
	{
		var userId = typeof input === 'number' ? input : input.id;
		var removedUsers = _.remove( this.collection, { id: userId } );

		if ( !removedUsers.length ) {
			return;
		}

		if ( removedUsers[0].isOnline ) {
			--this.onlineCount;
		}
		else {
			--this.offlineCount;
		}

		this.sort();
	};

	Chat_UserCollection.prototype.update = function( user )
	{
		var newUser = angular.extend( {}, this.get( user.id ), user );

		this.remove( user.id );
		this.add( newUser );
		this.sort();
	};

	Chat_UserCollection.prototype.online = function( input )
	{
		var user = this.get( input );
		if ( !user ) {
			return;
		}

		// Were they previously offline?
		if ( !user.isOnline ) {
			--this.offlineCount;
			++this.onlineCount;
		}

		user.isOnline = true;
		this.update( user );
	};

	Chat_UserCollection.prototype.offline = function( input )
	{
		var user = this.get( input );
		if ( !user ) {
			return;
		}

		// Were they previously online?
		if ( user.isOnline ) {
			++this.offlineCount;
			--this.onlineCount;
		}

		user.isOnline = false;
		this.update( user );
	};

	Chat_UserCollection.prototype.mute = function( input, isGlobal )
	{
		var user = this.get( input );
		if ( !user ) {
			return;
		}

		if ( isGlobal ) {
			user.isMutedGlobal = true;
		}
		else {
			user.isMutedRoom = true;
		}

		// If it was current user...
		var Chat = $injector.get( 'Chat' );
		if ( Chat.client.currentUser && user.id == Chat.client.currentUser.id ) {
			Chat.client.refreshMutedStates();
		}

		this.update( user );
	};

	Chat_UserCollection.prototype.unmute = function( input, isGlobal )
	{
		var user = this.get( input );
		if ( !user ) {
			return;
		}

		if ( isGlobal ) {
			user.isMutedGlobal = false;
		}
		else {
			user.isMutedRoom = false;
		}

		// If it was current user...
		var Chat = $injector.get( 'Chat' );
		if ( Chat.client.currentUser && user.id == Chat.client.currentUser.id ) {
			Chat.client.refreshMutedStates();
		}

		this.update( user );
	};

	Chat_UserCollection.prototype.mod = function( input )
	{
		var user = this.get( input );
		if ( !user ) {
			return;
		}

		user.isMod = 'moderator';

		// If it was current user...
		var Chat = $injector.get( 'Chat' );
		if ( Chat.client.currentUser && user.id == Chat.client.currentUser.id ) {
			Chat.client.refreshModStates();
		}

		this.update( user );
	};

	Chat_UserCollection.prototype.demod = function( input )
	{
		var user = this.get( input );
		if ( !user ) {
			return;
		}

		user.isMod = false;

		// If it was current user...
		var Chat = $injector.get( 'Chat' );
		if ( Chat.client.currentUser && user.id == Chat.client.currentUser.id ) {
			Chat.client.refreshModStates();
		}

		this.update( user );
	};

	Chat_UserCollection.prototype.sort = function()
	{
		var Chat = $injector.get( 'Chat' );

		var notifications;
		if ( this.type == Chat_UserCollection.TYPE_FRIEND && Chat.client ) {
			notifications = Chat.client.notifications;
		}

		// Group the users into buckets.
		var groupedUsers = {};
		groupedUsers = _.groupBy( this.collection, function( user )
		{
			if ( this.type == Chat_UserCollection.TYPE_ROOM ) {

				// We sort muted users to the bottom of the list.
				if ( user.isMutedRoom || user.isMutedGlobal ) {
					return 8;
				}

				// Sort mods to top of room lists.
				if ( user.isMod == 'owner' ) {
					return 1;
				}
				else if ( user.isMod == 'moderator' ) {
					return 2;
				}
				else if ( user.permissionLevel >= ChatConfig.SITE_MOD_PERMISSION ) {
					return 3;
				}
			}

			// Sort users with notifications at the top of friend lists.
			if ( notifications && notifications[ user.roomId ] ) {
				if ( user.isOnline ) {
					return 4;
				}
				return 5;
			}

			if ( user.isOnline ) {
				return 6;
			}

			return 7;
		}, this );

		// Sort the list.
		var groupedUsersArray = _.toArray( groupedUsers );
		for ( var i = 0; i < groupedUsersArray.length; ++i ) {
			groupedUsersArray[ i ].sort( function( a, b )
			{
				if ( a.displayName.toLowerCase() > b.displayName.toLowerCase() ) {
					return 1;
				}
				else if ( a.displayName.toLowerCase() < b.displayName.toLowerCase() ) {
					return -1;
				}
				return 0;
			} );
		}

		// Flatten it all out into a simple array.
		this.collection = _.flatten( groupedUsersArray );
	};

	return Chat_UserCollection;
} );
