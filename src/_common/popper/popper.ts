import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Backdrop } from '../../components/backdrop/backdrop.service';
import { Popper } from '../../components/popper/popper.service';
import AppBackdrop from '../backdrop/backdrop.vue';
import { Screen } from '../screen/screen-service';
import AppScrollScrollerTS from '../scroll/scroller/scroller';
import AppScrollScroller from '../scroll/scroller/scroller.vue';
import './popper.styl';

const mod: any = require('v-tooltip');

// Sync with the styles files.
const TransitionTime = 200;

let PopperIndex = 0;

@Component({
	components: {
		VPopover: mod.VPopover,
		AppScrollScroller,
	},
})
export default class AppPopper extends Vue {
	@Prop({ type: String, default: 'bottom' })
	placement!: 'top' | 'right' | 'bottom' | 'left';

	@Prop({ type: String, default: 'click' })
	trigger!: 'click' | 'hover' | 'manual';

	/**
	 * By default the popper will stay on the page until the user clicks outside
	 * of the popper. This tells the popper to close anytime the state changes.
	 * Useful for poppers in the shell that link to other pages on the site.
	 */
	@Prop(Boolean)
	hideOnStateChange?: boolean;

	/**
	 * Whether or not the popper should size itself to the same width as the
	 * trigger. Useful for poppers that work like "select" type controls.
	 */
	@Prop(Boolean)
	trackTriggerWidth?: boolean;

	/**
	 * Whether or not the popper should take up the full max width instead of
	 * relying on its content to size itself. Useful for poppers that change the
	 * content dynamically and you want it to stay one consistent size.
	 */
	@Prop(Boolean)
	forceMaxWidth?: boolean;

	@Prop()
	delay?: any;

	@Prop(Boolean)
	disabled?: boolean;

	@Prop(Boolean)
	show?: boolean;

	@Prop({ type: Boolean, default: true })
	autoHide!: boolean;

	@Prop(Boolean)
	block?: boolean;

	@Prop(String)
	openGroup?: string;

	$refs!: {
		popover: any;
		scroller: AppScrollScrollerTS;
	};

	isVisible = false;
	width = '';
	maxWidth = '';
	popperIndex = PopperIndex++;

	private hideTimeout?: NodeJS.Timer;
	private mobileBackdrop: AppBackdrop | null = null;

	get maxHeight() {
		return Screen.height - 100 + 'px';
	}

	get popperId() {
		return 'popper-' + this.popperIndex;
	}

	get popoverInnerClass() {
		let classes = ['popper-content'];
		if (this.trackTriggerWidth) {
			classes.push('-track-trigger-width');
		}
		if (this.forceMaxWidth) {
			classes.push('-force-max-width');
		}
		return classes.join(' ');
	}

	mounted() {
		Popper.registerPopper(this.$router, this);
	}

	destroyed() {
		Popper.deregisterPopper(this);
		this.clearHideTimeout();
		this.removeBackdrop();
	}

	hide() {
		this.$refs.popover.hide();
	}

	@Emit('show')
	onShow() {
		this.clearHideTimeout();
		this.isVisible = true;

		// If we are tracking a particular element's width, then we set this popover to be the same
		// width as the element. We don't track width when it's an XS screen since we do a full
		// width popover in those cases.
		let widthElem: HTMLElement | undefined;
		if (this.trackTriggerWidth && !Screen.isWindowXs) {
			widthElem = document.querySelector('#' + this.popperId) as HTMLElement | undefined;
			if (widthElem) {
				this.width = widthElem.offsetWidth + 'px';
				this.maxWidth = 'none';
			}
		}

		// If no element to base our width on, reset.
		if (!widthElem) {
			this.maxWidth = '';
			this.width = '';
		}

		this.addBackdrop();
	}

	onHide() {
		this.clearHideTimeout();
		this.hideTimeout = setTimeout(() => this.hideDone(), TransitionTime);
		this.removeBackdrop();
	}

	private addBackdrop() {
		if (Screen.isXs && !this.mobileBackdrop) {
			this.mobileBackdrop = Backdrop.push({ className: 'popper-backdrop' });
		}
	}

	private removeBackdrop() {
		if (Screen.isXs && this.mobileBackdrop) {
			Backdrop.remove(this.mobileBackdrop);
			this.mobileBackdrop = null;
		}
	}

	@Emit('hide')
	private hideDone() {
		this.isVisible = false;
	}

	private clearHideTimeout() {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = undefined;
		}
	}

	@Emit('auto-hide')
	private onAutoHide() {}
}
