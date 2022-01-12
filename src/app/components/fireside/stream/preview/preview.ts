import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Fireside } from '../../../../../_common/fireside/fireside.model';

@Options({
	components: {
		AppFiresideStreamPreviewVideo: () => import('./video.vue'),
	},
})
export default class AppFiresideStreamPreview extends Vue {
	@Prop({ type: Object, required: true })
	fireside!: Fireside;

	@Prop({ type: Boolean, default: true })
	showLive!: Fireside;

	@Prop({ type: Boolean })
	showLiveUsers!: Fireside;

	@Emit('changed') emitChanged(_hasVideo: boolean, _isStreaming: boolean) {}

	get location() {
		return this.fireside.location;
	}

	onVideoChanged(hasVideo: boolean, isStreaming: boolean) {
		this.emitChanged(hasVideo, isStreaming);
	}
}
