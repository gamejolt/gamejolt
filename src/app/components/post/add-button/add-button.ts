import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Game } from '../../../../_common/game/game.model';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { PostEditModal } from '../edit-modal/edit-modal-service';

@Options({
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

	@Prop(CommunityChannel)
	channel?: CommunityChannel;

	@Prop(String)
	placeholder?: string;

	@Prop(Boolean)
	previewOnly?: boolean;

	@AppState
	user!: AppStore['user'];

	readonly Screen = Screen;

	@Emit()
	add(_post: FiresidePost) {}

	get placeholderMessage() {
		return this.placeholder || this.$gettext(`So, what's on your mind?`);
	}

	async open() {
		if (this.previewOnly) {
			return;
		}

		const postProvider = FiresidePost.$create(this.game ? this.game.id : 0);

		const post = await PostEditModal.show(postProvider, {
			community: this.community,
			channel: this.channel,
		});

		if (!post) {
			return;
		}

		this.add(post);
	}
}
