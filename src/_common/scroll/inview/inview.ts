import Vue, { CreateElement } from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { ScrollInviewConfig } from './config';
import { ScrollInviewController } from './controller';
import { ScrollInviewParentController, ScrollInviewParentKey } from './parent-controller';

export type ScrollInviewEmitsOn = 'full-overlap' | 'partial-overlap';

@Component({})
export class AppScrollInview extends Vue {
	@Prop(propRequired(ScrollInviewConfig)) config!: ScrollInviewConfig;
	@Prop(propOptional(String, 'div')) tag!: string;

	@Prop(propOptional(ScrollInviewController, () => new ScrollInviewController()))
	controller!: ScrollInviewController;

	@Inject(ScrollInviewParentKey) parent!: ScrollInviewParentController;

	// These will get called by ScrollInviewContainer.
	@Emit('inview') emitInView() {}
	@Emit('outview') emitOutView() {}

	mounted() {
		// Set up the controller with the props from the component.
		this.parent.getContainer(this.config).observeItem(this);
	}

	destroyed() {
		this.parent.getContainer(this.config).unobserveItem(this);
	}

	render(h: CreateElement) {
		return h(this.tag, this.$slots.default);
	}
}
