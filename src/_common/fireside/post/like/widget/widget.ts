import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../../auth/store/index';
import { AppAuthRequired } from '../../../../auth/auth-required-directive';
import { number } from '../../../../filters/number';
import { Growls } from '../../../../growls/growls.service';
import { LikersModal } from '../../../../likers/modal.service';
import { AppTooltip } from '../../../../tooltip/tooltip';
import AppUserFollowWidget from '../../../../user/follow/widget.vue';
import { FiresidePost } from '../../post-model';
import { FiresidePostLike } from '../like-model';

@Component({
	components: {
		AppUserFollowWidget,
	},
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppFiresidePostLikeWidget extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	trans?: boolean;

	@Prop(Boolean)
	block?: boolean;

	@State
	app!: Store['app'];

	showLikeAnim = false;

	@Emit('change')
	emitChange(_value: boolean) {}

	get blip() {
		return this.post.like_count ? number(this.post.like_count) : '';
	}

	get tooltip() {
		if (!this.post.user_like) {
			return this.$gettext('Like This Post');
		} else {
			return this.$gettext('Liked!');
		}
	}

	async toggleLike() {
		const currentLike = this.post.user_like;

		if (!currentLike) {
			this.emitChange(true);

			const newLike = new FiresidePostLike({
				fireside_post_id: this.post.id,
			});

			this.post.user_like = newLike;
			++this.post.like_count;
			this.showLikeAnim = true;

			try {
				await newLike.$save();
			} catch (e) {
				this.post.user_like = null;
				--this.post.like_count;
				Growls.error(`Can't do that now. Try again later?`);
			}
		} else {
			this.emitChange(false);

			this.post.user_like = null;
			--this.post.like_count;
			this.showLikeAnim = false;

			try {
				await currentLike.$remove();
			} catch (e) {
				this.post.user_like = currentLike;
				++this.post.like_count;
				Growls.error(`Can't do that now. Try again later?`);
			}
		}
	}

	showLikers() {
		LikersModal.show({ count: this.post.like_count, resource: this.post });
	}
}
