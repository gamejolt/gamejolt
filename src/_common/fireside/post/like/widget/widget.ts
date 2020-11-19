import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../../auth/store/index';
import { AppAuthRequired } from '../../../../auth/auth-required-directive';
import {
	DrawerStore,
	DrawerStoreKey,
	handleNewStickerNotification,
} from '../../../../drawer/drawer-store';
import { fuzzynumber } from '../../../../filters/fuzzynumber';
import { Growls } from '../../../../growls/growls.service';
import { LikersModal } from '../../../../likers/modal.service';
import { Screen } from '../../../../screen/screen-service';
import { AppTooltip } from '../../../../tooltip/tooltip-directive';
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
	@Prop(FiresidePost) post!: FiresidePost;
	@Prop(Boolean) overlay?: boolean;
	@Prop(Boolean) trans?: boolean;
	@Prop(Boolean) block?: boolean;

	@Inject({ from: DrawerStoreKey, default: null }) drawer!: null | DrawerStore;

	@State app!: Store['app'];

	showLikeAnim = false;
	showDislikeAnim = false;
	readonly Screen = Screen;

	@Emit('change')
	emitChange(_value: boolean) {}

	get likeCount() {
		return fuzzynumber(this.post.like_count);
	}

	get liked() {
		return !!this.post.user_like;
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
			this.showDislikeAnim = false;

			try {
				const payload = await newLike.$save();
				if (payload.success && payload.newSticker && this.drawer) {
					handleNewStickerNotification(this.drawer);
				}
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
			this.showDislikeAnim = true;

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
