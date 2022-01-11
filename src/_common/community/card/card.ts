import { Options, Prop, Vue } from 'vue-property-decorator';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import AppMediaItemBackdrop from '../../media-item/backdrop/backdrop.vue';
import AppCommunityCardBase from '../card-base/card-base.vue';
import { Community } from '../community.model';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';

@Options({
	components: {
		AppCommunityCardBase,
		AppMediaItemBackdrop,
		AppCommunityThumbnailImg,
	},
})
export default class AppCommunityCard extends Vue {
	@Prop({ type: Object, required: true }) community!: Community;
	@Prop({ type: Boolean, default: false }) elevate!: boolean;
	@Prop({ type: Boolean, default: true }) allowEdit!: boolean;
	@Prop({ type: Boolean, default: false }) trackGoto!: boolean;

	trackGotoCommunity() {
		if (this.trackGoto) {
			trackGotoCommunity({
				source: 'card',
				id: this.community.id,
				path: this.community.path,
			});
		}
	}
}
