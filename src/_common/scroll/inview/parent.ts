import Vue, { CreateElement } from 'vue';
import { Component, Prop, Provide } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { ScrollInviewParentController, ScrollInviewParentKey } from './parent-controller';

@Component({})
export class AppScrollInviewParent extends Vue {
	// If this is a child of AppScrollScroller, we need to get it as a prop so
	// we can use that scroll element as the root context.
	@Prop(propOptional(undefined, null)) scroller!: null | HTMLElement;

	@Provide(ScrollInviewParentKey)
	controller = new ScrollInviewParentController(() => this.scroller);

	render(h: CreateElement) {
		return h('div', this.$slots.default);
	}
}
