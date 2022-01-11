import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppTimelineListItem from '../../../timeline-list/item/item.vue';
import { Comment, CommentBlockReason } from '../../comment-model';

@Options({
	components: {
		AppTimelineListItem,
	},
})
export default class AppCommentWidgetCommentBlocked extends Vue {
	@Prop({ type: Object, required: true }) comment!: Comment;
	@Prop({ type: String, required: true }) reason!: CommentBlockReason;

	@Emit('show') show() {}
}
