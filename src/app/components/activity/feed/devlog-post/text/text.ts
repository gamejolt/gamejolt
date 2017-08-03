import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./text.html';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppFadeCollapse } from '../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppWidgetCompiler } from '../../../../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { ActivityFeedItem } from '../../item-service';

@View
@Component({
	components: {
		AppFadeCollapse,
		AppWidgetCompiler,
	},
})
export class AppActivityFeedDevlogPostText extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;
	@Prop(Boolean) isHydrated?: boolean;

	post: FiresidePost = null as any;
	canToggleContent = false;
	contentBootstrapped = false;

	created() {
		this.post = this.item.feedItem as FiresidePost;
	}

	toggleFull() {
		this.item.isOpen = !this.item.isOpen;
		this.$emit('expanded');
	}

	// We wait for the fade collapse component to bootstrap in and potentially
	// restrict the content size before saying we're bootstrapped.
	async canToggleChanged(canToggle: boolean) {
		this.canToggleContent = canToggle;

		if (!this.contentBootstrapped) {
			this.contentBootstrapped = true;

			// Wait for the fade to restrict content now before emitting the
			// event.
			await this.$nextTick();
			this.$emit('content-bootstrapped');
		}
	}
}
