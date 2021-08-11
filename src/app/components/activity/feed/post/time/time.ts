import { Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { AppTimeAgo } from '../../../../../../_common/time/ago/ago';

@Options({
	components: {
		AppTimeAgo,
	},
})
export default class AppActivityFeedPostTime extends Vue {
	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	@Prop({ type: String, required: true })
	link!: string;

	get date() {
		return this.post.isActive ? this.post.published_on : this.post.added_on;
	}
}
