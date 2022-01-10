import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import AppLoading from '../../../../../_common/loading/loading.vue';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../../_common/user/user.model';
import { AppFiresideContainer } from '../../container/container';
import { createFiresideController, FiresideController } from '../../controller/controller';
import AppFiresideStreamVideo from '../video/video.vue';

@Options({
	components: {
		AppLoading,
		AppFiresideStreamVideo,
		AppFiresideContainer,
		AppUserAvatarList,
	},
})
export default class AppFiresideStreamPreviewVideo extends Vue {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	@Prop({ type: Boolean, default: true })
	showLive!: boolean;

	@Prop({ type: Boolean, default: true })
	showLiveUsers!: boolean;

	// Gets assigned with a real controller immediately, but needs this to not
	// break reactivity.
	c: FiresideController = null as any;

	isStreaming = false;

	@Emit('changed') emitChanged(_hasVideo: boolean, _isStreaming: boolean) {}

	created() {
		this.c = createFiresideController(this.fireside, { isMuted: true });
	}

	get rtcUsers() {
		if (!this.c || !this.c.rtc) {
			return [];
		}
		const users: User[] = [];
		this.c.rtc.users.forEach(i => {
			if (!i.userModel || i.userModel === this.fireside.user) {
				return;
			}
			users.push(i.userModel);
		});
		return users;
	}

	get focusedUser() {
		return this.c && this.c.rtc?.focusedUser;
	}

	get hasVideo() {
		return this.focusedUser?.hasVideo === true;
	}

	get shouldShowVideo() {
		// We can only show local videos in one place at a time. This will
		// re-grab the video feed when it gets rebuilt.
		return this.hasVideo && !(this.c.isShowingStreamSetup && this.c.rtc?.isFocusingMe);
	}

	@Watch('c.isStreaming')
	@Watch('hasVideo')
	onStateChanged() {
		this.emitChanged(this.hasVideo, this.c.isStreaming);
	}
}
