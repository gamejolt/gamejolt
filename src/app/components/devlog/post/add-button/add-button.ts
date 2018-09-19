import View from '!view!./add-button.html?style=./add-button.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DevlogPostEditModal } from '../edit-modal/edit-modal-service';

@View
@Component({})
export class AppDevlogPostAddButton extends Vue {
	@Prop(Game)
	game!: Game;

	readonly FiresidePost = FiresidePost;

	async open(attachmentType?: string) {
		const response = await Api.sendRequest(
			`/web/dash/developer/games/devlog/new-post/${this.game.id}`
		);

		let post: FiresidePost | undefined = new FiresidePost(response.post);

		post = await DevlogPostEditModal.show(post, { attachmentType: attachmentType || '' });
		if (!post) {
			return;
		}

		this.$emit('add', post);
	}
}
