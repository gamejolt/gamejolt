import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Comment } from '../../comment-model';

@Component({
	components: {},
})
export default class AppCommentWidgetCommentBlockOverlay extends Vue {
	@Prop(Comment)
	comment!: Comment;

	@Prop(String)
	reason!: string;

	@Emit('unblock')
	unblock() {}
}
