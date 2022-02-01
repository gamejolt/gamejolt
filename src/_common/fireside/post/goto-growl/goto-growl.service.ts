import { showSuccessGrowl } from '../../../growls/growls.service';
import { FiresidePost } from '../post-model';
import AppFiresidePostGotoGrowl, { Action } from './goto-growl.vue';

export class FiresidePostGotoGrowl {
	static async show(post: FiresidePost, action: Action) {
		showSuccessGrowl({
			component: AppFiresidePostGotoGrowl,
			props: { post, action },
			sticky: true,
		});
	}
}
