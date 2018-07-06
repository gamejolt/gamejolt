import Vue from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import View from '!view!./add-popover-button.html';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { DevlogPostEditModal } from '../../devlog/post/edit-modal/edit-modal-service';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';

@View
@Component({
	components: {
		AppPopover,
	},
	directives: {
		AppPopoverTrigger,
	},
})
export class AppDevlogPostAddPopoverButton extends Vue {
	@Prop(Game) game?: Game;
	@Prop(User) user?: User;

	@Emit()
	add(_post: FiresidePost) {}

	async showAddModal(type: string) {
		let url = `/web/dash/posts/new-post/${type}`;
		if (this.game) {
			url += '/' + this.game.id;
		}

		const response = await Api.sendRequest(url);

		let post: FiresidePost | undefined = new FiresidePost(response.post);

		post = await DevlogPostEditModal.show(post);
		if (!post) {
			return;
		}

		this.add(post);
	}
}
