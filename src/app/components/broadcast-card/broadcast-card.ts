import { Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../_common/card/card.vue';
import { FiresidePost } from '../../../_common/fireside/post/post-model';

@Options({
	components: {
		AppCard,
	},
})
export default class AppBroadcastCard extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;
}
