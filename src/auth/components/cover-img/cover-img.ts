import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { ImgHelper } from '../../../_common/img/helper/helper-service';

@Options({})
export default class AppCoverImg extends Vue {
	@Prop(String) imgUrl!: string;

	isLoaded = false;

	@Watch('imgUrl', { immediate: true })
	async onChanged() {
		this.isLoaded = false;
		await ImgHelper.loaded(this.imgUrl);
		this.isLoaded = true;
	}
}
