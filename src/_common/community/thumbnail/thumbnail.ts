import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
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
}
