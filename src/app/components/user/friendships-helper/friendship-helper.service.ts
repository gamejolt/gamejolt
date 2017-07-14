import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { UserFriendship } from '../../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Translate } from '../../../../lib/gj-lib-client/components/translate/translate.service';
import { ModalConfirm } from '../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { appStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';

export class UserFriendshipHelper {
	static async sendRequest(targetUser: User) {
		const request = new UserFriendship({ target_user_id: targetUser.id });

		try {
			await request.$save();

			Growls.success(
				Translate.$gettextInterpolate(
					`A friend request has been sent to @%{ username }. You'll be notified when they accept.`,
					{ username: request.target_user.username }
				),
				Translate.$gettext(`Request Sent`)
			);

			return request;
		} catch (e) {
			Growls.error(Translate.$gettext(`Friend request could not be sent.`));
			throw e;
		}
	}

	static async acceptRequest(request: UserFriendship) {
		try {
			await request.$accept();

			Growls.success(
				Translate.$gettextInterpolate(`You are now friends with @%{ username }!`, {
					username: request.user.username,
				}),
				Translate.$gettext(`Request Accepted`)
			);
		} catch (e) {
			Growls.error(Translate.$gettext(`Unable to accept friend request.`));
			throw e;
		}
	}

	static async cancelRequest(request: UserFriendship) {
		const confirmResult = await ModalConfirm.show(
			Translate.$gettextInterpolate(`Cancel the friend request you sent to @%{ username }?`, {
				username: request.target_user.username,
			}),
			undefined,
			'yes'
		);

		if (!confirmResult) {
			return false;
		}

		try {
			const response = await request.$remove();

			Growls.success(
				Translate.$gettextInterpolate(`Your friend request to @%{ username } was canceled.`, {
					username: request.target_user.username,
				}),
				Translate.$gettext(`Request Canceled`)
			);

			return response;
		} catch (e) {
			Growls.error(Translate.$gettext(`Unable to cancel friend request.`));
			throw e;
		}
	}

	static async rejectRequest(request: UserFriendship) {
		const confirmResult = await ModalConfirm.show(
			Translate.$gettextInterpolate(`Dismiss the friend request from @%{ username }?`, {
				username: request.user.username,
			}),
			undefined,
			'yes'
		);

		if (!confirmResult) {
			return false;
		}

		try {
			const response = await request.$remove();

			Growls.success(
				Translate.$gettextInterpolate(
					`You have dismissed the friend request from @%{ username }.`,
					{ username: request.user.username }
				),
				Translate.$gettext(`Request Dismissed`)
			);

			return response;
		} catch (e) {
			Growls.error(Translate.$gettext(`Unable to dismiss friend request.`));
			throw e;
		}
	}

	static async removeFriend(friendship: UserFriendship) {
		const them = friendship.getThem(appStore.state.user!);

		const confirmResult = await ModalConfirm.show(
			Translate.$gettextInterpolate(`Remove @%{ username } as a friend?`, {
				username: them.username,
			}),
			undefined,
			'yes'
		);

		if (!confirmResult) {
			return false;
		}

		try {
			const response = await friendship.$remove();

			Growls.success(
				Translate.$gettextInterpolate(`@%{ username } is no longer your friend.`, {
					username: them.username,
				}),
				Translate.$gettext('Friend Removed')
			);

			return response;
		} catch (e) {
			Growls.error(Translate.$gettext('Unable to remove friend.'));
			throw e;
		}
	}
}
