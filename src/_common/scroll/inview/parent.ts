import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ScrollWatcher } from '../../../components/scroll/watcher.service';
import { ScrollInviewContainer } from './container';

@Component({})
export class AppScrollInviewParent extends Vue {
	@Prop(Number)
	throttle?: number;

	@Prop(Number)
	velocity?: number;

	@Prop(ScrollInviewContainer)
	container?: ScrollInviewContainer;

	// Don't have Vue watch these.
	_scrollWatcher!: ScrollWatcher;
	_container!: ScrollInviewContainer;

	$el!: HTMLDivElement;

	mounted() {
		if (this.container) {
			this._container = this.container;
		} else {
			this._scrollWatcher = new ScrollWatcher(this.$el);
			this._container = new ScrollInviewContainer(
				this._scrollWatcher,
				this.throttle,
				this.velocity
			);
		}
	}

	render(h: CreateElement) {
		return h('div', this.$slots.default);
	}

	queueCheck() {
		return this._container.queueCheck();
	}
}
