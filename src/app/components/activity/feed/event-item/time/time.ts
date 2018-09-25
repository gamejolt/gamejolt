import View from '!view!./time.html';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppTimeAgo,
	},
})
export class AppActivityFeedEventItemTime extends Vue {
	@Prop(EventItem)
	eventItem!: EventItem;

	@Prop(FiresidePost)
	post?: FiresidePost;

	@Prop(String)
	link!: string;

	get shouldShowScheduled() {
		return this.post && this.post.isScheduled;
	}
}
