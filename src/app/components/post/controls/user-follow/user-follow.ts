import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';

@Options({
	components: {
		AppUserFollowWidget,
	},
})
export default class AppPostControlsUserFollow extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Prop({ type: Boolean, required: false, default: false })
	shouldShow!: boolean;

	readonly Screen = Screen;

	@Emit('close') emitClose() {}

	get user() {
		if (this.post.game && this.post.as_game_owner) {
			return this.post.game.developer;
		}

		return this.post.user;
	}
}
