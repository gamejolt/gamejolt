import { Injectable, Inject } from 'ng-metadata/core';
import { Location } from '../../../lib/gj-lib-client/components/location/location-service';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

@Injectable()
export class ProfileCtrl {
	user: any;
	headerMediaItem: any;
	gamesCount: number;
	isOnline: boolean;
	libraryGamesCount: number;
	activeGameSession: any;
	userFriendship: any;
	videosCount: number;

	constructor(
		@Inject('$scope') $scope: any,
		@Inject('Location') location: Location,
		@Inject('User_GameSession') userGameSession: any,
		@Inject('User_Friendship') userFriendship: any,
		@Inject('User_FriendshipsHelper') private userFriendshipsHelper: any,
		@Inject('Report_Modal') private reportModal: any,
		@Inject('profilePayload') profilePayload: any
	) {
		$scope.User = User;
		$scope.User_Friendship = userFriendship;

		this.user = new User(profilePayload.user);

		location.enforce({
			slug: this.user.slug,
		});

		this.headerMediaItem = profilePayload.headerMediaItem
			? new MediaItem(profilePayload.headerMediaItem)
			: null;
		this.gamesCount = profilePayload.gamesCount;
		this.isOnline = profilePayload.isOnline;
		this.libraryGamesCount = profilePayload.libraryGamesCount;
		this.activeGameSession = profilePayload.activeGameSession
			? new userGameSession(profilePayload.activeGameSession)
			: null;
		this.videosCount = profilePayload.videosCount || 0;

		if (profilePayload.userFriendship) {
			this.userFriendship = new userFriendship(profilePayload.userFriendship);
		}
	}

	acceptFriendRequest() {
		this.userFriendshipsHelper.acceptRequest(this.userFriendship);
	}

	sendFriendRequest() {
		this.userFriendshipsHelper.sendRequest(this.user).then((request: any) => {
			this.userFriendship = request;
		});
	}

	cancelFriendRequest() {
		this.userFriendshipsHelper.cancelRequest(this.userFriendship).then(() => {
			this.userFriendship = undefined;
		});
	}

	rejectFriendRequest() {
		this.userFriendshipsHelper.rejectRequest(this.userFriendship).then(() => {
			this.userFriendship = undefined;
		});
	}

	removeFriend() {
		this.userFriendshipsHelper.removeFriend(this.userFriendship).then(() => {
			this.userFriendship = undefined;
		});
	}

	report() {
		this.reportModal.show(this.user);
	}
}
