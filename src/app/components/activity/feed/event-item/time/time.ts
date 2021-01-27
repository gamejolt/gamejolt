import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { EventItem } from '../../../../../../_common/event-item/event-item.model';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { AppTimeAgo } from '../../../../../../_common/time/ago/ago';

@Component({
	components: {
		AppTimeAgo,
	},
})
export default class AppActivityFeedEventItemTime extends Vue {
	@Prop(EventItem) eventItem!: EventItem;
	@Prop(FiresidePost) post?: FiresidePost;
	@Prop(String) link!: string;
}
