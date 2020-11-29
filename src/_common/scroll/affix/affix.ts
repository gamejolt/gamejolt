import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { EventSubscription } from '../../../system/event/event-topic';
import { propOptional } from '../../../utils/vue';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';
import { ScrollInviewConfig } from '../inview/config';
import { AppScrollInview } from '../inview/inview';
import { Scroll } from '../scroll.service';

@Component({
	components: {
		AppScrollInview,
	},
})
export default class AppScrollAffix extends Vue {
	@Prop(propOptional(String, 'gj-scroll-affixed')) className!: string;
	@Prop(propOptional(Boolean, false)) disabled!: boolean;
	@Prop(propOptional(Number, 0)) scrollOffset!: number;

	@Prop({
		type: String,
		validator: i => ['top', 'bottom'].indexOf(i) !== -1,
		default: 'top',
	})
	anchor!: 'top' | 'bottom';

	shouldAffix = false;
	width: number | null = null;
	height = 0;
	InviewConfig!: ScrollInviewConfig;

	private resize$: EventSubscription | undefined;

	$refs!: {
		container: HTMLElement;
		placeholder: HTMLElement;
	};

	get isAffixed() {
		return this.shouldAffix && !this.disabled;
	}

	get cssClasses() {
		const classes = [];
		if (this.isAffixed) {
			classes.push(this.className);
		}

		if (this.anchor === 'top') {
			classes.push('-anchor-top');
		} else if (this.anchor === 'bottom') {
			classes.push('-anchor-bottom');
		}

		return classes;
	}

	created() {
		this.createInviewConfig();
	}

	mounted() {
		// If we resized, then the element dimensions most likely changed.
		this.resize$ = Screen.resizeChanges.subscribe(() => {
			// Always save dimensions, even if disabled, since we need to make
			// sure that if they enable at any point we're ready to affix it
			// properly.
			if (!this.shouldAffix) {
				return;
			}

			// Pull from the placeholder which should be the source of the
			// true width now.
			const placeholder = this.$refs.placeholder;
			if (placeholder) {
				this.width = Ruler.outerWidth(placeholder);
			}
		});
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	outview() {
		if (this.shouldAffix) {
			return;
		}

		this.width = Ruler.outerWidth(this.$refs.container);
		this.height = Ruler.outerHeight(this.$refs.container);
		this.shouldAffix = true;
	}

	inview() {
		if (!this.shouldAffix) {
			return;
		}

		this.shouldAffix = false;
	}

	private createInviewConfig() {
		let offset = this.scrollOffset;
		if (this.anchor === 'top') {
			offset += Scroll.offsetTop;
		}

		// The 10000px is so that it only considers the element "out of view" in
		// one direction.
		const margin =
			this.anchor === 'top' ? `-${offset}px 0px 10000px 0px` : `10000px 0px -${offset}px 0px`;

		this.InviewConfig = new ScrollInviewConfig({ margin, emitsOn: 'full-overlap' });
	}
}
