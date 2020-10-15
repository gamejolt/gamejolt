import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';

@Component({
	components: {
		AppUserFollowWidget,
	},
})
export default class AppEventItemControlsUserFollow extends Vue {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;
	@Prop(propOptional(Boolean, false)) shouldShow!: boolean;

	readonly Screen = Screen;

	@Emit('close') emitClose() {}

	get user() {
		if (this.post.game && this.post.as_game_owner) {
			return this.post.game.developer;
		}

		return this.post.user;
	}
}
