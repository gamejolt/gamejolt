import { Growls } from '../../../growls/growls.service';
import { FiresidePost } from '../post-model';
import { Action } from './goto-growl';
import AppFiresidePostGotoGrowl from './goto-growl.vue';

export class FiresidePostGotoGrowl {
	static async show(post: FiresidePost, action: Action) {
		Growls.success({
			component: AppFiresidePostGotoGrowl,
			props: { post, action },
			sticky: true,
		});
	}
}
