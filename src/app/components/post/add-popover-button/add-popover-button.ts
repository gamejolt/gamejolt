import View from '!view!./add-popover-button.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { AppPopover } from 'game-jolt-frontend-lib/components/popover/popover';
import { AppPopoverTrigger } from 'game-jolt-frontend-lib/components/popover/popover-trigger.directive.vue';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { PostEditModal } from '../edit-modal/edit-modal-service';

@View
@Component({
	components: {
		AppPopover,
	},
	directives: {
		AppPopoverTrigger,
	},
})
export class AppPostAddPopoverButton extends Vue {
	@Prop(Game)
	game?: Game;

	@Emit()
	add(_post: FiresidePost) {}

	async showAddModal() {
		let url = `/web/dash/posts/new-post`;
		if (this.game) {
			url += '/' + this.game.id;
		}

		const response = await Api.sendRequest(url);

		let post: FiresidePost | undefined = new FiresidePost(response.post);

		post = await PostEditModal.show(post);
		if (!post) {
			return;
		}

		this.add(post);
	}
}
