import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppProgressBar from '../../../../../_common/progress/bar/bar';
import { AppProgressPoller } from '../../../../../_common/progress/poller/poller';

@Component({
	components: {
		AppProgressPoller,
		AppProgressBar,
	},
})
export default class AppPostControlsSaveProgress extends Vue {
	@Prop({ type: FiresidePost, required: true })
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
