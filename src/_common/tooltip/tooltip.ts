import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper, Instance, Options } from '@popperjs/core/lib/popper-lite';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional } from '../../utils/vue';
import { TooltipModel } from './tooltip-model';

@Component({})
export default class AppTooltip extends Vue {
	@Prop(propOptional(TooltipModel)) tooltip?: TooltipModel;

	$el!: HTMLDivElement;

	private _popperInstance: null | Instance = null;
	private _popperTimeout: null | NodeJS.Timer = null;

	// mounted() {
	// 	this.check(this.tooltip);
	// }

	// beforeDestroy() {
	// 	this.destroyPopper();
	// }

	@Watch('tooltip')
	async check() {
		// Wait for the tooltip to be mounted.
		await this.$nextTick();

		console.log('tooltip changed');
		if (this.tooltip) {
			this.show();
		}

		// if (tooltip !== oldTooltip) {
		// 	this.destroyPopper();
		// }

		// if (tooltip && tooltip.isActive && !!tooltip.text) {
		// 	this.show();
		// } else {
		// 	this.scheduleDestroy();
		// }
	}

	private show() {
		if (!this.tooltip) {
			return;
		}

		const options: Options = {
			placement: this.tooltip.placement,
			modifiers: [flip, preventOverflow],
			strategy: 'absolute',
		};

		if (!this._popperInstance) {
			this._popperInstance = createPopper(this.tooltip.el, this.$el, options);
		} else {
			this.clearPopperTimeout();
			this._popperInstance.setOptions(options);
			// TODO: needed?
			this._popperInstance.update();
		}
	}

	private scheduleDestroy() {
		// Schedule to destroy the popper so that we don't keep checking scroll
		// position if not needed.
		this._popperTimeout = setTimeout(() => this.destroyPopper(), 1000);
	}

	private clearPopperTimeout() {
		if (this._popperTimeout) {
			clearTimeout(this._popperTimeout);
			this._popperTimeout = null;
		}
	}

	private destroyPopper() {
		// Just in case it might still be scheduled.
		this.clearPopperTimeout();

		if (this._popperInstance) {
			this._popperInstance.destroy();
			this._popperInstance = null;
		}
	}
}
