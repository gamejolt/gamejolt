import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import AppTimelineListItem from '../../../timeline-list/item/item.vue';
import { Comment, CommentBlockReason } from '../../comment-model';

@Options({
	components: {
		AppTimelineListItem,
	},
})
export default class AppCommentWidgetCommentBlocked extends Vue {
	@Prop(propRequired(Object)) comment!: Comment;
	@Prop(propRequired(String)) reason!: CommentBlockReason;

	@Emit('show') show() {}
}
