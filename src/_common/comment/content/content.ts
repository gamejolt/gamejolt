import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { date } from '../../../vue/filters/date';
import { AppTrackEvent } from '../../analytics/track-event.directive';
import AppContentViewer from '../../content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../fade-collapse/fade-collapse.vue';
import { Comment } from '../comment-model';
import '../comment.styl';
import AppCommentVideoThumbnail from '../video/thumbnail/thumbnail.vue';

@Component({
	components: {
		AppFadeCollapse,
		AppCommentVideoThumbnail,
		AppContentViewer,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		date,
	},
})
export default class AppCommentContent extends Vue {
	@Prop(Comment) comment!: Comment;
	@Prop(String) content?: string;

	canToggleContent = false;
	showFullContent = false;
	showAllVideos = false;

	readonly date = date;
}
