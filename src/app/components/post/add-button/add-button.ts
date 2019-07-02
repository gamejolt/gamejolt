import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppUserAvatarImg from 'game-jolt-frontend-lib/components/user/user-avatar/img/img.vue';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import FormPost from '../../forms/post/post.vue';

@Component({
	components: {
		AppUserAvatarImg,
		FormPost,
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

	@Emit()
	add(_post: FiresidePost) {}

	opened = false;
	_isBlocked = false;

	localPost?: FiresidePost;

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

		this.localPost = post;
		this.opened = true;

		// post = await PostEditModal.show(post, { community: this.community });
		// this._isBlocked = false;

		// if (!post) {
		// 	return;
		// }

		// this.add(post);
	}

	onSubmitted(post: FiresidePost) {
		this._isBlocked = false;
		this.opened = false;
		this.localPost = undefined;

		if (!post) {
			return;
		}

		this.add(post);
	}
}
