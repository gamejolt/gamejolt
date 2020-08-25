import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
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
}
