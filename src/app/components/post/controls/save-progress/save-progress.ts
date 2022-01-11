import { Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import { AppProgressPoller } from '../../../../../_common/progress/poller/poller';

@Options({
	components: {
		AppProgressPoller,
		AppProgressBar,
	},
})
export default class AppPostControlsSaveProgress extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	// Before the first bit of progress arrives, show a full indeterminate bar.
	progress = 1;
	isIndeterminate = true;

	onProgress({ post }: any, progress: number, isIndeterminate: boolean) {
		this.progress = progress;
		this.isIndeterminate = isIndeterminate;
		this.assignPost(post);
	}

	onComplete({ post }: any) {
		this.assignPost(post);
	}

	private assignPost(postData: any) {
		if (postData) {
			const post = new FiresidePost(postData);
			this.post.assign(post);
		}
	}
}
