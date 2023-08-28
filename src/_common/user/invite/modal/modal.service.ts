import { defineAsyncComponent } from 'vue';
import { showSuccessGrowl } from '../../../growls/growls.service';
import { showModal } from '../../../modal/modal.service';
import { $gettext } from '../../../translate/translate.service';
import { UserModel } from '../../user.model';

export async function showUserInviteFollowModal(user: UserModel) {
	const result = await showModal<boolean>({
		modalId: 'userInviteFollow',
		component: defineAsyncComponent(() => import('./AppUserInviteFollowModal.vue')),
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
