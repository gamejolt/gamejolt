import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import { Community } from '../../community.model';

@Options({
	components: {
		AppImgResponsive,
	},
})
export default class AppCommunityThumbnailImg extends Vue {
	@Prop(Community)
	community!: Community;
}
