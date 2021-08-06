import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import AppMediaItemBackdrop from '../../media-item/backdrop/backdrop.vue';
import { Community } from '../community.model';
import AppCommunityThumbnailImg from './img/img.vue';

@Component({
	components: {
		AppCommunityThumbnailImg,
		AppMediaItemBackdrop,
	},
})
export default class AppCommunityThumbnail extends Vue {
	@Prop({ type: Community, required: true })
	community!: Community;

	onGotoCommunity() {
		trackGotoCommunity({
			source: 'thumbnail',
			id: this.community.id,
			path: this.community.path,
		});
	}
}
