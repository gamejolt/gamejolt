import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppCard from '../../../_common/card/card.vue';
import { FiresidePost } from '../../../_common/fireside/post/post-model';

@Component({
	components: {
		AppCard,
	},
})
export default class AppBroadcastCard extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;
}
