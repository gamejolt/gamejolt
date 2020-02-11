import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../filters/number';
import { BaseModal } from '../../modal/base';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { getCommentModelResourceName } from '../comment-model';
import { CommentState, CommentStore } from '../comment-store';
import AppCommentWidget from '../widget/widget.vue';
import { DisplayMode } from './modal.service';

@Component({
	components: {
		AppCommentWidget,
	},
})
export default class AppCommentModal extends BaseModal {
	@Prop(String)
	displayMode!: DisplayMode;

	@Prop(Model)
	model!: Model;

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	readonly number = number;
	readonly Screen = Screen;

	get commentsCount() {
		const store = this.getCommentStore(getCommentModelResourceName(this.model), this.model.id);
		return store ? store.count : 0;
	}

	get autofocusAdd() {
		return !Screen.isXs;
	}

	onReplyAdd() {
		// Dismiss the modal when a reply is added.
		this.modal.dismiss();
	}

	destroyed() {
		// If there was a permalink in the URL, we want to remove it when closing the comment modal.
		const hash = this.$route.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		this.$router.replace(Object.assign({}, this.$route, { hash: '' }));
	}
}
