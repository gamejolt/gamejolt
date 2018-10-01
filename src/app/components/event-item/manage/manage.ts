import View from '!view!./manage.html';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppEventItemManagePost } from './post/post';

@View
@Component({
	components: {
		AppEventItemManagePost,
	},
})
export class AppEventItemManage extends Vue {
	@Prop(EventItem)
	eventItem!: EventItem;

	@Prop(Boolean)
	showEditControls?: boolean;

	@Emit('edit-post')
	emitEditPost() {}

	@Emit('publish-post')
	emitPublishPost() {}

	@Emit('remove-post')
	emitRemovePost() {}

	get post() {
		if (this.eventItem.type === EventItem.TYPE_POST_ADD) {
			return this.eventItem.action as FiresidePost;
		}
	}
}
