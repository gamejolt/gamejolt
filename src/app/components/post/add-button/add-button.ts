import View from '!view!./add-button.html?style=./add-button.styl';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { AppUserAvatarImg } from 'game-jolt-frontend-lib/components/user/user-avatar/img/img';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { PostEditModal } from '../edit-modal/edit-modal-service';

@View
@Component({
	components: {
		AppUserAvatarImg,
	},
})
export class AppPostAddButton extends Vue {
	@Prop(Game)
	game?: Game;

	@AppState
	user!: AppStore['user'];

	@Emit()
	add(_post: FiresidePost) {}

	async open(attachmentType?: string) {
		if (PostEditModal.canShow) {
			// Block the modal from appearing multiple times between the post request being sent and the modal opening
			PostEditModal.blockModal();

			let post: FiresidePost | undefined = await FiresidePost.$create(
				this.game ? this.game.id : 0
			);

			PostEditModal.unblockModal();

			post = await PostEditModal.show(post, { attachmentType: attachmentType || '' });
			if (!post) {
				return;
			}

			this.add(post);
		}
	}
}
