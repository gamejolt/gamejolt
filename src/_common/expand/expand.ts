import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({})
export default class AppExpand extends Vue {
	@Prop(Boolean) when?: boolean;
	@Prop(Boolean) animateInitial?: boolean;

	inDom = false;

	created() {
		this.inDom = !!this.when;
	}

	async mounted() {
		if (this.inDom) {
			(this.$el as HTMLElement).style.height = 'auto';

			// This simulates having it closed and then showing immediately to
			// slide it out.
			if (this.animateInitial) {
				(this.$el as HTMLElement).style.height = '0';
				this.inDom = false;
				await this.$nextTick();
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
			await this.$nextTick();

			// Should be in DOM now so we can pull height.
			(this.$el as HTMLElement).style.height = this.$el.scrollHeight + 'px';
		} else {
			(this.$el as HTMLElement).style.height = this.$el.scrollHeight + 'px';

			// Reading offsetWidth forces a browser reflow.
			// This way the change from explicit height to 0 is noticed.
			this.forceReflow();

			this.$el.classList.add('transition');
			(this.$el as HTMLElement).style.height = '0';
		}
	}

	private forceReflow() {
		return (this.$el as HTMLElement).offsetWidth;
	}

	// For clean up work after transitions.
	afterTransition() {
		if (this.when) {
			this.$el.classList.remove('transition');
			(this.$el as HTMLElement).style.height = 'auto';
		} else if (!this.when) {
			this.$el.classList.remove('transition');
			this.inDom = false;
		}
	}
}
