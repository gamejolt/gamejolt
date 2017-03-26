import { Chat } from './chat.service';
import { ChatUser } from './user';
import { ChatRoom } from './room';

export class ChatUserCollection
{
	static readonly TYPE_FRIEND = 'friend';
	static readonly TYPE_ROOM = 'room';

	collection: ChatUser[] = [];
	onlineCount = 0;
	offlineCount = 0;

	constructor( public type: 'friend' | 'room', users: any[] = [] )
	{
		if ( users && users.length ) {
			for ( const user of users ) {
				if ( user.isOnline ) {
					++this.onlineCount;
				}
				else {
					++this.offlineCount;
				}

				// setTrackId( user );
				this.collection.push( new ChatUser( user ) );
			}
		}

		this.sort();
	}

	// function setTrackId( user )
	// {
	// 	// Update their track by field so that user lists know that they've changed.
	// 	user._trackId = user.id + ':' + Date.now();

	// 	// If we have any chat tabs for this user, we need to update the user on the room
	// 	// object as well. Otherwise it won't update when user info changes.
	// 	var Chat = $injector.get( 'Chat' );
	// 	if ( Chat.client.openRooms[ user.roomId ] ) {
	// 		Chat.client.openRooms[ user.roomId ].user = user;
	// 	}
	// }

	get( input: number | ChatUser )
	{
		const userId = typeof input === 'number' ? input : input.id;
		return this.collection.find( ( user ) => user.id === userId );
	}

	getByRoom( input: number | ChatRoom )
	{
		const roomId = typeof input === 'number' ? input : input.id;
		return this.collection.find( ( user ) => user.roomId === roomId );
	}

	has( input: number | ChatUser )
	{
		return !!this.get( input );
	}

	// // Sadly, not only does angular need us to change the track by,
	// // but it also check on object equality to see if anything has changed
	// // in the array it ng-repeats on.
	// _touch = function( user )
	// {
	// 	var newUser = angular.copy( user );
	// 	setTrackId( newUser );
	// 	var index = _.findIndex( this.collection, { id: user.id } );
	// 	if ( index !== -1 ) {
	// 		this.collection[ index ] = newUser;
	// 	}
	// };

	// touch = function( input )
	// {
	// 	var user = this.get( input );
	// 	if ( user ) {
	// 		this._touch( user );
	// 	}
	// };

	// touchRoom = function( input )
	// {
	// 	var user = this.getByRoom( input );
	// 	if ( user ) {
	// 		this._touch( user );
	// 	}
	// };

	// touchAll = function()
	// {
	// 	for ( var i = 0; i < this.collection.length; ++i ) {
	// 		this._touch( this.collection[ i ] );
	// 	}
	// };

	add( user: ChatUser )
	{
		// Don't add the same user again.
		if ( this.has( user ) ) {
			return;
		}

		// setTrackId( user );

		if ( user.isOnline ) {
			++this.onlineCount;
		}
		else if ( user.isOnline ) {
			++this.offlineCount;
		}

		this.collection.push( user );
		this.sort();
	}

	remove( input: number | ChatUser )
	{
		const userId = typeof input === 'number' ? input : input.id;
		const index = this.collection.findIndex( ( user ) => user.id === userId );

		if ( index !== -1 ) {
			const user = this.collection[ index ];

			if ( user.isOnline ) {
				--this.onlineCount;
			}
			else {
				--this.offlineCount;
			}

			this.collection.splice( index, 1 );
		}
		else {
			return;
		}

		this.sort();
	}

	update( user: ChatUser )
	{
		const curUser = this.get( user );
		if ( curUser ) {
			Object.assign( curUser, user );
		}

		// this.collection.splice( index, 1, user );
		// var newUser = angular.extend( {}, this.get( user.id ), user );

		// this.remove( user.id );
		// this.add( newUser );
		this.sort();
	}

	online( input: number | ChatUser )
	{
		const user = this.get( input );
		if ( !user ) {
			return;
		}

		// Were they previously offline?
		if ( !user.isOnline ) {
			--this.offlineCount;
			++this.onlineCount;
		}

		user.isOnline = true;
		// this.update( user );
	}

	offline( input: number | ChatUser )
	{
		const user = this.get( input );
		if ( !user ) {
			return;
		}

		// Were they previously online?
		if ( user.isOnline ) {
			++this.offlineCount;
			--this.onlineCount;
		}

		user.isOnline = false;
		// this.update( user );
	}

	mute( input: number | ChatUser, isGlobal: boolean )
	{
		const user = this.get( input );
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
		// var Chat = $injector.get( 'Chat' );
		if ( Chat.client.currentUser && user.id === Chat.client.currentUser.id ) {
			Chat.client.refreshMutedStates();
		}

		// this.update( user );
	}

	unmute( input: number | ChatUser, isGlobal: boolean )
	{
		const user = this.get( input );
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
		if ( Chat.client.currentUser && user.id === Chat.client.currentUser.id ) {
			Chat.client.refreshMutedStates();
		}

		// this.update( user );
	}

	mod( input: number | ChatUser )
	{
		const user = this.get( input );
		if ( !user ) {
			return;
		}

		user.isMod = 'moderator';

		// If it was current user...
		if ( Chat.client.currentUser && user.id === Chat.client.currentUser.id ) {
			Chat.client.refreshModStates();
		}

		// this.update( user );
	}

	demod( input: number | ChatUser )
	{
		const user = this.get( input );
		if ( !user ) {
			return;
		}

		user.isMod = false;

		// If it was current user...
		if ( Chat.client.currentUser && user.id === Chat.client.currentUser.id ) {
			Chat.client.refreshModStates();
		}

		// this.update( user );
	}

	sort()
	{
		let notifications;
		if ( this.type === ChatUserCollection.TYPE_FRIEND && Chat.client ) {
			notifications = Chat.client.notifications;
		}

		// // Group the users into buckets.
		// const numBuckets = 8;
		// let groupedUsers: { [k: number]: ChatUser[] } = {};
		// for ( let i = 0; i < numBuckets; ++i ) {
		// 	groupedUsers[ i ] = [];
		// }

		// for ( const user of this.collection ) {
			// if ( this.type === ChatUserCollection.TYPE_ROOM ) {

			// 	// We sort muted users to the bottom of the list.
			// 	if ( user.isMutedRoom || user.isMutedGlobal ) {
			// 		return groupedUsers[7].push( user );
			// 	}

			// 	// Sort mods to top of room lists.
			// 	if ( user.isMod === 'owner' ) {
			// 		return groupedUsers[0].push( user );
			// 	}
			// 	else if ( user.isMod === 'moderator' ) {
			// 		return groupedUsers[1].push( user );
			// 	}
			// 	else if ( user.permissionLevel >= ChatConfig.SITE_MOD_PERMISSION ) {
			// 		return groupedUsers[2].push( user );
			// 	}
			// }

			// // Sort users with notifications at the top of friend lists.
			// if ( notifications && notifications[ user.roomId ] ) {
			// 	if ( user.isOnline ) {
			// 		return groupedUsers[3].push( user );
			// 	}
			// 	return groupedUsers[4].push( user );
			// }

			// if ( user.isOnline ) {
			// 	return groupedUsers[5].push( user );
			// }

			// return groupedUsers[6].push( user );
		// }

		// Sort the list.
		// const groupedUsersArray = Object.values<ChatUser[]>( groupedUsers );
		// for ( let i = 0; i < groupedUsersArray.length; ++i ) {
			this.collection.sort( ( a, b ) =>
			{
				// We group users into different areas.
				// The grouped sort val takes precedence.
				const aSort = this.getSortVal( a, notifications );
				const bSort = this.getSortVal( b, notifications );
				if ( aSort > bSort ) {
					return 1;
				}
				else if ( aSort < bSort ) {
					return -1;
				}

				if ( a.displayName.toLowerCase() > b.displayName.toLowerCase() ) {
					return 1;
				}
				else if ( a.displayName.toLowerCase() < b.displayName.toLowerCase() ) {
					return -1;
				}

				return 0;
			} );
		// }

		// Flatten it all out into a simple array.

		// this.collection = _.flatten( groupedUsersArray );
	}

	private getSortVal( user: ChatUser, notifications )
	{
		if ( this.type === ChatUserCollection.TYPE_ROOM ) {

			// We sort muted users to the bottom of the list.
			if ( user.isMutedRoom || user.isMutedGlobal ) {
				return 7;
			}

			// Sort mods to top of room lists.
			if ( user.isMod === 'owner' ) {
				return 0;
			}
			else if ( user.isMod === 'moderator' ) {
				return 1;
			}
			else if ( user.permissionLevel >= Chat.SITE_MOD_PERMISSION ) {
				return 2;
			}
		}

		// Sort users with notifications at the top of friend lists.
		if ( notifications && notifications[ user.roomId ] ) {
			if ( user.isOnline ) {
				return 3;
			}
			return 4;
		}

		if ( user.isOnline ) {
			return 5;
		}

		return 6;
	}
}
