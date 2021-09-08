import { Growls } from '../../growls/growls.service';
import AppApprovedLoginGrowl from './approved-login-growl.vue';

export class UserApprovedLoginGrowl {
	static async show() {
		Growls.error({
			component: AppApprovedLoginGrowl,
			sticky: true,
		});
	}
}
