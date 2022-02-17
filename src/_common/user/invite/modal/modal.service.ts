import { defineAsyncComponent } from 'vue';
import { showSuccessGrowl } from '../../../growls/growls.service';
import { showModal } from '../../../modal/modal.service';
import { $gettextInterpolate } from '../../../translate/translate.service';
import { User } from '../../user.model';

export async function showUserInviteFollowModal(user: User) {
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

export function showUserInviteFollowGrowl(user: User) {
	showSuccessGrowl(
		$gettextInterpolate(`Added %{ user } to your follows.`, {
			user: '@' + user.username,
		})
	);
}
