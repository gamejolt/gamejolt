import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../../../app/store/index';
import { AppTrackEvent } from '../../../analytics/track-event.directive';
import { AppTooltip } from '../../../tooltip/tooltip';
import AppUserCardHover from '../../../user/card/hover/hover.vue'
import AppUserAvatar from '../../../user/user-avatar/user-avatar.vue'
import { CommentVideoModal } from '../modal/modal.service';
import { CommentVideo } from '../video-model';
import './thumbnail-content.styl';

@Component({
	components: {
		AppUserCardHover,
		AppUserAvatar,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
})
export default class AppCommentVideoThumbnail extends Vue {
	@Prop(CommentVideo) video!: CommentVideo;

	@State app!: Store['app'];

	isLoaded = false;

	get comment() {
		return this.video.comment;
	}

	get user() {
		return this.comment.user;
	}

	showModal() {
		CommentVideoModal.show(this.video);
	}

	onThumbLoaded() {
		this.isLoaded = true;
	}
}
