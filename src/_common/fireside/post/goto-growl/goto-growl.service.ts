import AppFiresidePostGotoGrowl, { Action } from '~common/fireside/post/goto-growl/AppFiresidePostGotoGrowl.vue';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { showSuccessGrowl } from '~common/growls/growls.service';

export class FiresidePostGotoGrowl {
	static async show(post: FiresidePostModel, action: Action) {
		showSuccessGrowl({
			component: AppFiresidePostGotoGrowl,
			props: { post, action },
			sticky: true,
		});
	}
}
