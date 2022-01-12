import { nextTick } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';

@Options({})
export default class AppExpand extends Vue {
	@Prop(Boolean) when?: boolean;
	@Prop(Boolean) animateInitial?: boolean;

	inDom = false;

	created() {
		this.inDom = !!this.when;
	}

	declare $el: HTMLElement;

	async mounted() {
		if (this.inDom) {
			this.$el.style.height = 'auto';

			// This simulates having it closed and then showing immediately to
			// slide it out.
			if (this.animateInitial) {
				this.$el.style.height = '0';
				this.inDom = false;
				await nextTick();
				this.onWhenWatch();
			}
		}
	}

	@Watch('when')
	async onWhenWatch() {
		if (this.when) {
			// Show in DOM as soon as possible.
			// This will get the correct height to expand out to.
			this.inDom = true;
			this.$el.classList.add('transition');
			await nextTick();

			// Should be in DOM now so we can pull height.
			this.$el.style.height = this.$el.scrollHeight + 'px';
		} else {
			this.$el.style.height = this.$el.scrollHeight + 'px';

			// Reading offsetWidth forces a browser reflow.
			// This way the change from explicit height to 0 is noticed.
			this.forceReflow();

			this.$el.classList.add('transition');
			this.$el.style.height = '0';
		}
	}

	private forceReflow() {
		return this.$el.offsetWidth;
	}

	// For clean up work after transitions.
	afterTransition() {
		if (this.when) {
			this.$el.classList.remove('transition');
			this.$el.style.height = 'auto';
		} else if (!this.when) {
			this.$el.classList.remove('transition');
			this.inDom = false;
		}
	}
}
