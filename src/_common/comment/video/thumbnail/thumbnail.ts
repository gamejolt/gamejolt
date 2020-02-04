import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppStore } from '../../../store/app-store';
import { AppTooltip } from '../../../tooltip/tooltip';
import AppUserCardHover from '../../../user/card/hover/hover.vue';
import AppUserAvatar from '../../../user/user-avatar/user-avatar.vue';
import { CommentVideoModal } from '../modal/modal.service';
import { CommentVideo } from '../video-model';
import './thumbnail-content.styl';

@Component({
	components: {
		AppUserCardHover,
		AppUserAvatar,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommentVideoThumbnail extends Vue {
	@Prop(CommentVideo) video!: CommentVideo;

	@State app!: AppStore;

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
