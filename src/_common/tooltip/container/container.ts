import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

let containers = 0;

@Component({})
export class AppTooltipContainer extends Vue {
	containerId = ++containers;

	render(h: CreateElement) {
		return h(
			'div',
			{
				domProps: {
					id: 'tooltip-container-' + this.containerId,
				},
			},
			this.$slots.default
		);
	}
}
