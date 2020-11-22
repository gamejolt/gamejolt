import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppMediaItemPost from '../../../../../_common/media-item/post/post.vue';

@Component({
	components: {
		AppContentViewer,
		AppMediaItemPost,
	},
})
export default class AppTimeoutResourcesPost extends Vue {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;
}
