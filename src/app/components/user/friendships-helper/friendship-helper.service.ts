import { showErrorGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Payload } from '../../../../_common/payload/payload-service';
import { commonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import {
	$acceptUserFriendship,
	$removeUserFriendship,
	$saveUserFriendship,
	UserFriendshipModel,
} from '../../../../_common/user/friendship/friendship.model';
import { UserModel } from '../../../../_common/user/user.model';

export class UserFriendshipHelper {
	static async sendRequest(targetUser: UserModel) {
		const request = new UserFriendshipModel({ target_user_id: targetUser.id });

		try {
			await $saveUserFriendship(request);

			showSuccessGrowl(
				$gettext(
					`A friend request has been sent to @%{ username }. You'll be notified when they accept.`,
					{ username: request.target_user.username }
				),
				$gettext(`Request Sent`)
			);

			return request;
		} catch (e) {
			showErrorGrowl($gettext(`Friend request could not be sent.`));
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
			await $acceptUserFriendship(request);

			showSuccessGrowl(
				$gettext(`You are now friends with @%{ username }!`, {
					username: request.user.username,
				}),
				$gettext(`Request Accepted`)
			);

			return true;
		} catch (e) {
			showErrorGrowl($gettext(`Unable to accept friend request.`));

			if (Payload.hasFormError(e, 'friendship-not-found')) {
				return false;
			}

			throw e;
		}
	}

	static async cancelRequest(request: UserFriendshipModel) {
		const confirmResult = await showModalConfirm(
			$gettext(`Cancel the friend request you sent to @%{ username }?`, {
				username: request.target_user.username,
			})
		);

		if (!confirmResult) {
			return false;
		}

		try {
			const response = await $removeUserFriendship(request);

			showSuccessGrowl(
				$gettext(`Your friend request to @%{ username } was canceled.`, {
					username: request.target_user.username,
				}),
				$gettext(`Request Canceled`)
			);

			return response;
		} catch (e) {
			showErrorGrowl($gettext(`Unable to cancel friend request.`));
			throw e;
		}
	}

	static async rejectRequest(request: UserFriendshipModel) {
		const confirmResult = await showModalConfirm(
			$gettext(`Dismiss the friend request from @%{ username }?`, {
				username: request.user.username,
			})
		);

		if (!confirmResult) {
			return false;
		}

		try {
			const response = await $removeUserFriendship(request);

			showSuccessGrowl(
				$gettext(`You have dismissed the friend request from @%{ username }.`, {
					username: request.user.username,
				}),
				$gettext(`Request Dismissed`)
			);

			return response;
		} catch (e) {
			showErrorGrowl($gettext(`Unable to dismiss friend request.`));
			throw e;
		}
	}

	static async removeFriend(friendship: UserFriendshipModel) {
		const them = friendship.getThem(commonStore.user.value!);

		const confirmResult = await showModalConfirm(
			$gettext(`Remove @%{ username } as a friend?`, {
				username: them.username,
			})
		);

		if (!confirmResult) {
			return false;
		}

		try {
			const response = await $removeUserFriendship(friendship);

			showSuccessGrowl(
				$gettext(`@%{ username } is no longer your friend.`, {
					username: them.username,
				}),
				$gettext('Friend Removed')
			);

			return response;
		} catch (e) {
			showErrorGrowl($gettext('Unable to remove friend.'));
			throw e;
		}
	}
}
