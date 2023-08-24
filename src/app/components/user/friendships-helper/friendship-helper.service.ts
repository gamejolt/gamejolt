import { showErrorGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Payload } from '../../../../_common/payload/payload-service';
import { commonStore } from '../../../../_common/store/common-store';
import { Translate } from '../../../../_common/translate/translate.service';
import { UserFriendshipModel } from '../../../../_common/user/friendship/friendship.model';
import { UserModel } from '../../../../_common/user/user.model';

export class UserFriendshipHelper {
	static async sendRequest(targetUser: UserModel) {
		const request = new UserFriendshipModel({ target_user_id: targetUser.id });

		try {
			await request.$save();

			showSuccessGrowl(
				Translate.$gettextInterpolate(
					`A friend request has been sent to @%{ username }. You'll be notified when they accept.`,
					{ username: request.target_user.username }
				),
				Translate.$gettext(`Request Sent`)
			);

			return request;
		} catch (e) {
			showErrorGrowl(Translate.$gettext(`Friend request could not be sent.`));
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
	static async acceptRequest(request: UserFriendshipModel) {
		try {
			await request.$accept();

			showSuccessGrowl(
				Translate.$gettextInterpolate(`You are now friends with @%{ username }!`, {
					username: request.user.username,
				}),
				Translate.$gettext(`Request Accepted`)
			);

			return true;
		} catch (e) {
			showErrorGrowl(Translate.$gettext(`Unable to accept friend request.`));

			if (Payload.hasFormError(e, 'friendship-not-found')) {
				return false;
			}

			throw e;
		}
	}

	static async cancelRequest(request: UserFriendshipModel) {
		const confirmResult = await showModalConfirm(
			Translate.$gettextInterpolate(`Cancel the friend request you sent to @%{ username }?`, {
				username: request.target_user.username,
			})
		);

		if (!confirmResult) {
			return false;
		}

		try {
			const response = await request.$remove();

			showSuccessGrowl(
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
			showErrorGrowl(Translate.$gettext(`Unable to cancel friend request.`));
			throw e;
		}
	}

	static async rejectRequest(request: UserFriendshipModel) {
		const confirmResult = await showModalConfirm(
			Translate.$gettextInterpolate(`Dismiss the friend request from @%{ username }?`, {
				username: request.user.username,
			})
		);

		if (!confirmResult) {
			return false;
		}

		try {
			const response = await request.$remove();

			showSuccessGrowl(
				Translate.$gettextInterpolate(
					`You have dismissed the friend request from @%{ username }.`,
					{ username: request.user.username }
				),
				Translate.$gettext(`Request Dismissed`)
			);

			return response;
		} catch (e) {
			showErrorGrowl(Translate.$gettext(`Unable to dismiss friend request.`));
			throw e;
		}
	}

	static async removeFriend(friendship: UserFriendshipModel) {
		const them = friendship.getThem(commonStore.user.value!);

		const confirmResult = await showModalConfirm(
			Translate.$gettextInterpolate(`Remove @%{ username } as a friend?`, {
				username: them.username,
			})
		);

		if (!confirmResult) {
			return false;
		}

		try {
			const response = await friendship.$remove();

			showSuccessGrowl(
				Translate.$gettextInterpolate(`@%{ username } is no longer your friend.`, {
					username: them.username,
				}),
				Translate.$gettext('Friend Removed')
			);

			return response;
		} catch (e) {
			showErrorGrowl(Translate.$gettext('Unable to remove friend.'));
			throw e;
		}
	}
}
