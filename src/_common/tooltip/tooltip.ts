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

	beforeDestroy() {
		this.destroyPopper();
	}

	// We need to watch for changes of the tooltip instance and its data.
	@Watch('tooltip')
	@Watch('tooltip.text')
	@Watch('tooltip.isActive')
	@Watch('tooltip.placement')
	async check() {
		// Wait for the tooltip to be mounted.
		await this.$nextTick();

		if (!this.tooltip || !this.tooltip.text || !this.tooltip.isActive) {
			return this.scheduleDestroy();
		}

		this.show();
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
			// Set the popper reference element to the new tooltip element.
			this._popperInstance.state.elements.reference = this.tooltip.el;
		}
	}

	private scheduleDestroy() {
		// Schedule to destroy the popper so that we don't keep checking scroll
		// position if not needed. Needs to be longer than our transition speed.
		if (!this._popperTimeout) {
			this._popperTimeout = setTimeout(() => this.destroyPopper(), 300);
		}
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
