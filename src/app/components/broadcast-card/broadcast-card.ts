import View from '!view!./broadcast-card.html?style=./broadcast-card.styl';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { AppCard } from 'game-jolt-frontend-lib/components/card/card';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppCard,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppBroadcastCard extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;
}
