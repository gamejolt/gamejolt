import View from '!view!./text.html?style=./text.styl';
import { AppFadeCollapse } from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { AppWidgetCompiler } from 'game-jolt-frontend-lib/components/widget-compiler/widget-compiler';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ActivityFeedItem } from '../../item-service';

@View
@Component({
	components: {
		AppFadeCollapse,
		AppWidgetCompiler,
	},
})
export class AppActivityFeedDevlogPostText extends Vue {
	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	isHydrated?: boolean;

	isToggling = false;

	async mounted() {
		await this.$nextTick();
		this.$emit('content-bootstrapped');
	}

	async toggleFull() {
		if (this.isToggling) {
			return;
		}

		this.isToggling = true;
		this.$emit('expanded');

		// If we collapsed.
		if (!this.item.isOpen) {
			this.expand();
		} else {
			this.collapse();
		}
	}

	expand() {
		this.item.isOpen = true;
		this.isToggling = false;
	}

	collapse() {
		// We will scroll to the bottom of the element minus some extra padding. This keeps the
		// element in view a bit.
		const elementOffset = Scroll.getElementOffsetFromContext(this.$el);
		const scrollTo = elementOffset - Screen.windowHeight * 0.25;

		// Only if we're past where we would scroll.
		if (Scroll.getScrollTop() > elementOffset) {
			Scroll.to(scrollTo, { animate: false });
			this.item.isOpen = false;

			setTimeout(() => {
				this.isToggling = false;
			}, 1000);
		} else {
			this.item.isOpen = false;
			this.isToggling = false;
		}
	}
}
