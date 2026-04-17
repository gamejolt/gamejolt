import { defineAsyncComponent } from 'vue';

import { showSuccessGrowl } from '~common/growls/growls.service';
import { showModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';

export async function showUserInviteFollowModal(user: UserModel) {
	const result = await showModal<boolean>({
		modalId: 'userInviteFollow',
		component: defineAsyncComponent(
			() => import('~common/user/invite/modal/AppUserInviteFollowModal.vue')
		),
		props: {
			user,
		},
		size: 'xs',
	});

	if (result) {
		showUserInviteFollowGrowl(user);
	}
}

export function showUserInviteFollowGrowl(user: UserModel) {
	showSuccessGrowl(
		$gettext(`Added %{ user } to your follows.`, {
			user: '@' + user.username,
		})
	);
}
