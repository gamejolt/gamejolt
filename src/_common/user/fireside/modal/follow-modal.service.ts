import { defineAsyncComponent } from 'vue';
import { showSuccessGrowl } from '../../../growls/growls.service';
import { showModal } from '../../../modal/modal.service';
import { $gettextInterpolate } from '../../../translate/translate.service';
import { UserModel } from '../../user.model';

export async function showUserFiresideFollowModal(user: UserModel) {
	const result = await showModal<boolean>({
		modalId: 'userFiresideFollow',
		component: defineAsyncComponent(() => import('./AppUserFiresideFollowModal.vue')),
		props: {
			user,
		},
		size: 'xs',
	});

	if (result) {
		showUserFiresideFollowGrowl(user);
	}
}

export function showUserFiresideFollowGrowl(user: UserModel) {
	showSuccessGrowl(
		$gettextInterpolate(`Added %{ user } to your follows.`, {
			user: '@' + user.username,
		})
	);
}
