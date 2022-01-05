import { setup } from 'vue-class-component';
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import AppBackdrop from '../backdrop/backdrop';
import { DrawerStore, DrawerStoreKey } from '../drawer/drawer-store';
import { EscapeStack, EscapeStackCallback } from '../escape-stack/escape-stack.service';
import { Screen } from '../screen/screen-service';
import AppScrollAffix from '../scroll/affix/affix.vue';
import AppScrollScroller, { createScroller } from '../scroll/scroller/scroller.vue';
import AppStickerLayer from '../sticker/layer/layer.vue';
import { AppTheme } from '../theme/theme';
import { Modal, ModalKey } from './modal.service';

@Options({
	components: {
		AppTheme,
		AppScrollScroller,
		AppScrollAffix,
		AppStickerLayer,
	},
})
export default class AppModal extends Vue {
	@Prop(Number) index!: number;
	@Prop(Object) theme?: any;

	@Inject({ from: ModalKey })
	modal!: Modal;

	@Inject({ from: DrawerStoreKey, default: null })
	drawer!: null | DrawerStore;

	isHoveringContent = false;
	scroller = setup(() => createScroller());

	private backdrop?: AppBackdrop;
	private beforeEachDeregister?: Function;
	private escapeCallback?: EscapeStackCallback;

	@Emit('close') emitClose() {}

	get zIndex() {
		return 1050 + this.modal.index;
	}

	get hasFooter() {
		// TODO(vue3): check
		return !!this.$slots.footer;
	}

	mounted() {
		if (!this.modal.noBackdrop) {
			// TODO(vue3)
			// this.backdrop = Backdrop.push({
			// 	context: this.$el,
			// 	className: 'modal-backdrop',
			// });
		}

		this.beforeEachDeregister = this.$router.beforeEach((_to, _from, next) => {
			this.dismissRouteChange();
			next();
		});

		this.escapeCallback = () => this.dismissEsc();
		EscapeStack.register(this.escapeCallback);
	}

	unmounted() {
		// Make sure we clear the reference to it.
		if (this.backdrop) {
			this.backdrop.remove();
			this.backdrop = undefined;
		}

		if (this.beforeEachDeregister) {
			this.beforeEachDeregister();
			this.beforeEachDeregister = undefined;
		}

		if (this.escapeCallback) {
			EscapeStack.deregister(this.escapeCallback);
			this.escapeCallback = undefined;
		}
	}

	dismissRouteChange() {
		this.dismiss();
	}

	dismissEsc() {
		if (this.modal.noEscClose) {
			return;
		}

		this.dismiss();
	}

	dismissBackdrop() {
		if (
			Screen.isMobile ||
			this.modal.noBackdropClose ||
			this.isHoveringContent ||
			this.drawer?.isDrawerOpen
		) {
			return;
		}
		this.dismiss();
	}

	dismiss() {
		this.emitClose();
		this.modal.dismiss();
	}

	scrollTo(offsetY: number) {
		this.scroller.scrollTo(offsetY);
	}
}
