import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { findVueParent } from '../../../utils/vue';

export function findTooltipContainer(component: Vue) {
	const container = findVueParent(component, AppTooltipContainer);
	if (!container) {
		return undefined;
	}
	return '#tooltip-container-' + container.containerId;
}

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
