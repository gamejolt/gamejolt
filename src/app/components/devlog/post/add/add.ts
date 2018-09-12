import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./add.html';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { DevlogPostEditModal } from '../edit-modal/edit-modal-service';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';

@View
@Component({})
export class AppDevlogPostAdd extends Vue {
	@Prop(Game)
	game?: Game;

	@Prop(User)
	user?: User;

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

		this.$emit('add', post);
	}
}
