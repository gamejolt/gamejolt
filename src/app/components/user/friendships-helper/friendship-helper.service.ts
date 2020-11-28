import { Growls } from '../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Payload } from '../../../../_common/payload/payload-service';
import { appStore } from '../../../../_common/store/app-store';
import { Translate } from '../../../../_common/translate/translate.service';
import { UserFriendship } from '../../../../_common/user/friendship/friendship.model';
import { User } from '../../../../_common/user/user.model';

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

	/**
	 * Attempts to accept a friends request.
	 *
	 * Note: This function throws on any unexpected error,
	 * but returns false for other errors that should be gracefully dismissed,
	 * for instance when attempting to accept a friendship that was cancelled.
	 */
	static async acceptRequest(request: UserFriendship) {
		try {
			await request.$accept();

			Growls.success(
				Translate.$gettextInterpolate(`You are now friends with @%{ username }!`, {
					username: request.user.username,
				}),
				Translate.$gettext(`Request Accepted`)
			);

			return true;
		} catch (e) {
			Growls.error(Translate.$gettext(`Unable to accept friend request.`));

			if (Payload.hasFormError(e, 'friendship-not-found')) {
				return false;
			}

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
				Translate.$gettextInterpolate(
					`Your friend request to @%{ username } was canceled.`,
					{
						username: request.target_user.username,
					}
				),
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
