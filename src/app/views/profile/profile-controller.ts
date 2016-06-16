export class ProfileCtrl
{
	user: any;
	headerMediaItem: any;
	gamesCount: number;
	isOnline: boolean;
	libraryGamesCount: number;
	activeGameSession: any;
	userFriendship: any;

	static $inject = [ '$scope', 'Location', 'user', 'User_GameSession', 'User_Friendship', 'User_FriendshipsHelper', 'Report_Modal', 'MediaItem', 'profilePayload' ];

	constructor(
		$scope: any,
		location: any,
		user: any,
		userGameSession: any,
		userFriendship: any,
		private userFriendshipsHelper: any,
		private reportModal: any,
		mediaItem: any,
		profilePayload: any
	)
	{
		$scope.User = user;
		$scope.User_Friendship = userFriendship;

		this.user = new user( profilePayload.user );

		location.enforce( {
			slug: this.user.slug,
		} );

		this.headerMediaItem = profilePayload.headerMediaItem ? new mediaItem( profilePayload.headerMediaItem ) : null;
		this.gamesCount = profilePayload.gamesCount;
		this.isOnline = profilePayload.isOnline;
		this.libraryGamesCount = profilePayload.libraryGamesCount;
		this.activeGameSession = profilePayload.activeGameSession ? new userGameSession( profilePayload.activeGameSession ) : null;

		if ( profilePayload.userFriendship ) {
			this.userFriendship = new userFriendship( profilePayload.userFriendship );
		}
	}

	acceptFriendRequest()
	{
		this.userFriendshipsHelper.acceptRequest( this.userFriendship );
	}

	sendFriendRequest()
	{
		this.userFriendshipsHelper.sendRequest( this.user )
			.then( ( request ) =>
			{
				this.userFriendship = request;
			} );
	}

	cancelFriendRequest()
	{
		this.userFriendshipsHelper.cancelRequest( this.userFriendship )
			.then( () =>
			{
				this.userFriendship = undefined;
			} );
	}

	rejectFriendRequest()
	{
		this.userFriendshipsHelper.rejectRequest( this.userFriendship )
			.then( () =>
			{
				this.userFriendship = undefined;
			} );
	}

	removeFriend()
	{
		this.userFriendshipsHelper.removeFriend( this.userFriendship )
			.then( () =>
			{
				this.userFriendship = undefined;
			} );
	}

	report()
	{
		this.reportModal.show( this.user );
	}
}
