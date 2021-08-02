import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import AppMediaItemBackdrop from '../../media-item/backdrop/backdrop.vue';
import AppCommunityCardBase from '../card-base/card-base.vue';
import { Community } from '../community.model';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';

@Component({
	components: {
		AppCommunityCardBase,
		AppMediaItemBackdrop,
		AppCommunityThumbnailImg,
	},
})
export default class AppCommunityCard extends Vue {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propOptional(Boolean, false)) elevate!: boolean;
	@Prop(propOptional(Boolean, true)) allowEdit!: boolean;
	@Prop(propOptional(Boolean, false)) trackGoto!: boolean;

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
