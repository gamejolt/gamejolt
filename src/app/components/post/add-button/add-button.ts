import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Game } from '../../../../_common/game/game.model';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { PostEditModal } from '../edit-modal/edit-modal-service';

@Component({
	components: {
		AppUserAvatarImg,
	},
	directives: {
		AppAuthRequired,
	},
})
export default class AppPostAddButton extends Vue {
	@Prop(Game)
	game?: Game;

	@Prop(Community)
	community?: Community;

	@Prop(String)
	placeholder?: string;

	@AppState
	user!: AppStore['user'];

	_isBlocked = false;
	readonly Screen = Screen;

	@Emit()
	add(_post: FiresidePost) {}

	get placeholderMessage() {
		return this.placeholder || this.$gettext(`So, what's on your mind?`);
	}

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
