import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./edit-modal.html';

import { BaseModal } from '../../../../../lib/gj-lib-client/components/modal/base';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGameDevlogPost } from '../../../forms/game/devlog-post/devlog-post';

@View
@Component({
	components: {
		AppJolticon,
		FormGameDevlogPost,
	},
})
export default class AppDevlogPostEditModal extends BaseModal {
	@Prop(FiresidePost) post: FiresidePost;

	onSubmitted(post: FiresidePost) {
		this.modal.resolve(post);
	}
}
