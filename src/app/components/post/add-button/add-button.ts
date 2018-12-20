import View from '!view!./add-button.html?style=./add-button.styl';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
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

	@Prop(Community)
	community?: Community;

	@AppState
	user!: AppStore['user'];

	@Emit()
	add(_post: FiresidePost) {}

	_isBlocked = false;

	async open() {
		if (this._isBlocked) {
			return;
		}

		// Block the modal from appearing multiple times between the post request being sent and the modal opening
		this._isBlocked = true;

		let post: FiresidePost | undefined = await FiresidePost.$create(
			this.game ? this.game.id : 0
		);

		post = await PostEditModal.show(post, { community: this.community });
		this._isBlocked = false;

		if (!post) {
			return;
		}

		this.add(post);
	}
}
