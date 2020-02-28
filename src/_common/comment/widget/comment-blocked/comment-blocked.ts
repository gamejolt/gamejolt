import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import AppTimelineListItem from '../../../timeline-list/item/item.vue';
import { Comment, CommentBlockReason } from '../../comment-model';

@Component({
	components: {
		AppTimelineListItem,
	},
})
export default class AppCommentWidgetCommentBlocked extends Vue {
	@Prop(propRequired(Comment)) comment!: Comment;
	@Prop(propRequired(String)) reason!: CommentBlockReason;

	@Emit('show') show() {}
}
