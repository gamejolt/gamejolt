import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../components/community/community.model';
import { AppImgResponsive } from '../../../img/responsive/responsive';

@Component({
	components: {
		AppImgResponsive,
	},
})
export default class AppCommunityThumbnailImg extends Vue {
	@Prop(Community)
	community!: Community;
}
