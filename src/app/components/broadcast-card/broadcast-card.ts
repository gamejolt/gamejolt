import View from '!view!./broadcast-card.html?style=./broadcast-card.styl';
import { AppCard } from 'game-jolt-frontend-lib/components/card/card';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppCard,
	},
})
export class AppBroadcastCard extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;
}
