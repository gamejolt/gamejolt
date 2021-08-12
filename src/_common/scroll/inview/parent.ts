import { h } from 'vue';
import { Options, Prop, Provide, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { ScrollInviewParentController, ScrollInviewParentKey } from './parent-controller';

@Options({})
export class AppScrollInviewParent extends Vue {
	// If this is a child of AppScrollScroller, we need to get it as a prop so
	// we can use that scroll element as the root context.
	@Prop(propOptional(undefined, null)) scroller!: null | HTMLElement;

	@Provide({ to: ScrollInviewParentKey })
	controller = new ScrollInviewParentController(() => this.scroller);

	render() {
		return h('div', {}, this.$slots.default);
	}
}
