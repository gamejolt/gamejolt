import { h } from 'vue';
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { ScrollInviewConfig } from './config';
import { ScrollInviewController } from './controller';
import { ScrollInviewParentController, ScrollInviewParentKey } from './parent-controller';

export type ScrollInviewEmitsOn = 'full-overlap' | 'partial-overlap';

@Options({})
export class AppScrollInview extends Vue {
	@Prop(propRequired(ScrollInviewConfig)) config!: ScrollInviewConfig;
	@Prop(propOptional(String, 'div')) tag!: string;

	@Prop(propOptional(ScrollInviewController, () => new ScrollInviewController()))
	controller!: ScrollInviewController;

	@Inject({ from: ScrollInviewParentKey })
	parent!: ScrollInviewParentController;

	// These will get called by ScrollInviewContainer.
	@Emit('inview') emitInView() {}
	@Emit('outview') emitOutView() {}

	mounted() {
		// Set up the controller with the props from the component.
		this.parent.getContainer(this.config).observeItem(this);
	}

	unmounted() {
		this.parent.getContainer(this.config).unobserveItem(this);
	}

	render() {
		return h(this.tag, {}, this.$slots.default);
	}
}
