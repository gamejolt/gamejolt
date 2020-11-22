import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Comment } from '../../../../../_common/comment/comment-model';
import AppCommentContent from '../../../../../_common/comment/content/content.vue';
import AppCommentControls from '../../../../../_common/comment/controls/controls.vue';
import AppMessageThreadItem from '../../../../../_common/message-thread/item/item.vue';

@Component({
	components: {
		AppCommentContent,
		AppMessageThreadItem,
		AppCommentControls,
	},
})
export default class AppTimeoutResourcesComment extends Vue {
	@Prop(propRequired(Comment)) comment!: Comment;
}
