angular.module( 'App.Views' ).controller( 'ProfileCtrl', function( $scope, Location, User, User_GameSession, User_Friendship, User_FriendshipsHelper, ModalConfirm, Growls, profilePayload )
{
	var _this = this;

	$scope.User = User;
	$scope.User_Friendship = User_Friendship;

	this.user = new User( profilePayload.user );

	Location.enforce( {
		slug: this.user.slug,
	} );

	this.gamesCount = profilePayload.gamesCount;
	this.isOnline = profilePayload.isOnline;
	this.headerImg = profilePayload.headerImg;
	this.libraryGamesCount = profilePayload.libraryGamesCount;
	this.activeGameSession = profilePayload.activeGameSession ? new User_GameSession( profilePayload.activeGameSession ) : null;

	if ( profilePayload.userFriendship ) {
		this.userFriendship = new User_Friendship( profilePayload.userFriendship );
	}

	this.acceptFriendRequest = function()
	{
		User_FriendshipsHelper.acceptRequest( this.userFriendship );
	};

	this.sendFriendRequest = function()
	{
		User_FriendshipsHelper.sendRequest( this.user ).then( function( request )
		{
			_this.userFriendship = request;
		} );
	};

	this.cancelFriendRequest = function()
	{
		User_FriendshipsHelper.cancelRequest( _this.userFriendship ).then( function()
		{
			_this.userFriendship = undefined;
		} );
	};

	this.rejectFriendRequest = function()
	{
		User_FriendshipsHelper.rejectRequest( _this.userFriendship ).then( function()
		{
			_this.userFriendship = undefined;
		} );
	};

	this.removeFriend = function()
	{
		User_FriendshipsHelper.removeFriend( _this.userFriendship ).then( function()
		{
			_this.userFriendship = undefined;
		} );
	};
} );
