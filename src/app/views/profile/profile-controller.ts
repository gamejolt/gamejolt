export class ProfileCtrl
{
	user: any;
	headerMediaItem: any;
	gamesCount: number;
	isOnline: boolean;
	libraryGamesCount: number;
	activeGameSession: any;
	userFriendship: any;

	constructor(
		$scope,
		Location,
		User,
		User_GameSession,
		User_Friendship,
		private User_FriendshipsHelper,
		private Report_Modal,
		MediaItem,
		profilePayload
	)
	{
		$scope.User = User;
		$scope.User_Friendship = User_Friendship;

		this.user = new User( profilePayload.user );

		Location.enforce( {
			slug: this.user.slug,
		} );

		this.headerMediaItem = profilePayload.headerMediaItem ? new MediaItem( profilePayload.headerMediaItem ) : null;
		this.gamesCount = profilePayload.gamesCount;
		this.isOnline = profilePayload.isOnline;
		this.libraryGamesCount = profilePayload.libraryGamesCount;
		this.activeGameSession = profilePayload.activeGameSession ? new User_GameSession( profilePayload.activeGameSession ) : null;

		if ( profilePayload.userFriendship ) {
			this.userFriendship = new User_Friendship( profilePayload.userFriendship );
		}
	}

	acceptFriendRequest()
	{
		this.User_FriendshipsHelper.acceptRequest( this.userFriendship );
	}

	sendFriendRequest()
	{
		this.User_FriendshipsHelper.sendRequest( this.user )
			.then( ( request ) =>
			{
				this.userFriendship = request;
			} );
	}

	cancelFriendRequest()
	{
		this.User_FriendshipsHelper.cancelRequest( this.userFriendship )
			.then( () =>
			{
				this.userFriendship = undefined;
			} );
	}

	rejectFriendRequest()
	{
		this.User_FriendshipsHelper.rejectRequest( this.userFriendship )
			.then( () =>
			{
				this.userFriendship = undefined;
			} );
	}

	removeFriend()
	{
		this.User_FriendshipsHelper.removeFriend( this.userFriendship )
			.then( () =>
			{
				this.userFriendship = undefined;
			} );
	}

	report()
	{
		this.Report_Modal.show( this.user );
	}
}
