import { AppTrackEvent } from '../../../_common/analytics/track-event.directive';
import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppCard,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppBroadcastCard extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;
}
