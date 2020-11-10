import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Inject, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../utils/vue';
import { CommentStoreManager, CommentStoreManagerKey } from '../comment/comment-store';
import { CommentThreadModal } from '../comment/thread/modal.service';
import AppUserAvatarImg from '../user/user-avatar/img/img.vue';
import { StickerPlacement } from './placement/placement.model';
import { StickerTargetController } from './target/target-controller';

@Component({
	components: {
		AppUserAvatarImg,
	},
})
export default class AppSticker extends Vue {
	@Prop(propRequired(StickerPlacement)) sticker!: StickerPlacement;
	@Prop(propRequired(StickerTargetController)) controller!: StickerTargetController;
	@Prop(propOptional(Boolean, true)) isClickable!: boolean;
	@Inject(CommentStoreManagerKey) commentManager!: CommentStoreManager;

	$refs!: {
		outer: HTMLDivElement;
		inner: HTMLImageElement;
	};

	@Emit('click')
	emitClick() {}

	get shouldShowComment() {
		return this.isClickable && !!this.sticker.comment;
	}

	get commentUser() {
		return this.sticker.comment!.user;
	}

	mounted() {
		this.onUpdateStickerPlacement();
	}

	@Watch('sticker.position_x')
	@Watch('sticker.position_y')
	@Watch('sticker.rotation')
	async onUpdateStickerPlacement() {
		await this.$nextTick();

		this.$refs.outer.style.left = `calc(${this.sticker.position_x * 100}% - 32px)`;
		this.$refs.outer.style.top = `calc(${this.sticker.position_y * 100}% - 32px)`;
		// Transform the inner element so the parent component can assign
		// translateY() while transitioning in
		this.$refs.inner.style.transform = `rotate(${this.sticker.rotation * 90 - 45}deg)`;
	}

	async onClick() {
		if (this.isClickable) {
			if (this.sticker.comment) {
				CommentThreadModal.show({
					parentId: this.sticker.comment.parent_id || this.sticker.comment.id,
					commentId: this.sticker.comment.id,
					displayMode: 'comments',
					model: this.controller.commentOwner,
					autofocus: false,
				});
			} else {
				this.emitClick();
			}
		}
	}
}
