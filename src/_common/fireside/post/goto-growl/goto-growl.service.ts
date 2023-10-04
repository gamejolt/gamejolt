import { showSuccessGrowl } from '../../../growls/growls.service';
import { FiresidePostModel } from '../post-model';
import AppFiresidePostGotoGrowl, { Action } from './AppFiresidePostGotoGrowl.vue';

export class FiresidePostGotoGrowl {
	static async show(post: FiresidePostModel, action: Action) {
		showSuccessGrowl({
			component: AppFiresidePostGotoGrowl,
			props: { post, action },
			sticky: true,
		});
	}
}
