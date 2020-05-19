import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { ScrollInviewContainer } from './container';

@Component({})
export class AppScrollInviewParent extends Vue {
	// If this is a child of AppScrollScroller, we need to get it as a prop so
	// we can use that scroll element as the root context.
	@Prop(propOptional(undefined, null)) scroller!: null | HTMLElement;

	// We need to create a new container for each unique "margin" that our
	// AppScrollInview children need. This is a map of margin => container.
	private containers = new Map<string, ScrollInviewContainer>();

	/**
	 * We need a different container for each unique "margin" that we need to
	 * watch for. This function will return a container for the specific margin
	 * passed in. If it doesn't have one yet for the specific margin, it will
	 * dynamically create one.
	 */
	getContainer(margin: string) {
		const container = this.containers.get(margin);
		if (!container) {
			const root = this.scroller;
			const newContainer = new ScrollInviewContainer(root, margin);
			this.containers.set(margin, newContainer);
			return newContainer;
		}

		return container;
	}

	render(h: CreateElement) {
		return h('div', this.$slots.default);
	}
}
