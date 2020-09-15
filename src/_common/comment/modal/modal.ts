import { Component, Inject, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { number } from '../../filters/number';
import { BaseModal } from '../../modal/base';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { getCommentModelResourceName } from '../comment-model';
import { CommentStoreManager, CommentStoreManagerKey, getCommentStore } from '../comment-store';
import AppCommentWidget from '../widget/widget.vue';
import { DisplayMode } from './modal.service';

@Component({
	components: {
		AppCommentWidget,
	},
})
export default class AppCommentModal extends BaseModal {
	@Inject(CommentStoreManagerKey) commentManager!: CommentStoreManager;

	@Prop(String)
	displayMode!: DisplayMode;

	@Prop(Model)
	model!: Model;

	@Prop(propOptional(String))
	initialTab?: string;

	readonly number = number;
	readonly Screen = Screen;

	get commentsCount() {
		const store = getCommentStore(
			this.commentManager,
			getCommentModelResourceName(this.model),
			this.model.id
		);
		return store ? store.totalCount : 0;
	}

	get autofocusAdd() {
		return !Screen.isXs;
	}

	onReplyAdd() {
		// Dismiss the modal when a reply is added.
		this.modal.dismiss();
	}
}
