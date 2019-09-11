import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../utils/vue';
import AppBackdrop from '../backdrop/backdrop';
import { Backdrop } from '../backdrop/backdrop.service';
import { EscapeStack } from '../escape-stack/escape-stack.service';
import { Screen } from '../screen/screen-service';
import AppScrollAffix from '../scroll/affix/affix.vue';
import AppScrollScrollerTS from '../scroll/scroller/scroller';
import AppScrollScroller from '../scroll/scroller/scroller.vue';
import { AppTheme } from '../theme/theme';
import { BaseModal } from './base';
import './modal-global.styl';
import { Modal } from './modal.service';

@Component({
	components: {
		AppTheme,
		AppScrollScroller,
		AppScrollAffix,
	},
})
export default class AppModal extends Vue {
	@Prop(Number)
	index!: number;

	@Prop(Object)
	theme?: any;

	modal: Modal = null as any;
	isHoveringContent = false;

	private backdrop?: AppBackdrop;
	private beforeEachDeregister?: Function;
	private escapeCallback?: Function;

	$el!: HTMLDivElement;

	$refs!: {
		scroller: AppScrollScrollerTS;
	};

	get zIndex() {
		return 1050 + this.modal.index;
	}

	get hasFooter() {
		return !!this.$slots.footer;
	}

	created() {
		const parent = findRequiredVueParent(this, BaseModal);
		this.modal = parent.modal;
	}

	mounted() {
		if (!this.modal.noBackdrop) {
			this.backdrop = Backdrop.push({
				context: this.$el,
				className: 'modal-backdrop',
			});
		}

		this.beforeEachDeregister = this.$router.beforeEach((_to, _from, next) => {
			this.dismissRouteChange();
			next();
		});

		this.escapeCallback = () => this.dismissEsc();
		EscapeStack.register(this.escapeCallback);
	}

	destroyed() {
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
		if (Screen.isMobile || this.modal.noBackdropClose || this.isHoveringContent) {
			return;
		}
		this.dismiss();
	}

	dismiss() {
		this.modal.dismiss();
	}

	scrollTo(offsetY: number) {
		this.$refs.scroller.scrollTo(offsetY);
	}
}
