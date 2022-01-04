import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import AppLoading from '../../../loading/loading.vue';
import { Sticker } from '../../../sticker/sticker.model';
import { ContentOwnerController, ContentOwnerControllerKey } from '../../content-owner';

@Options({
	components: {
		AppImgResponsive,
		AppLoading,
	},
})
export default class AppContentSticker extends Vue {
	@Prop(propRequired(Number)) stickerId!: number;
	@Prop(Boolean) isEditing!: boolean;
	@Prop(Boolean) isDisabled!: boolean;

	@Inject({ from: ContentOwnerControllerKey })
	owner!: ContentOwnerController;

	sticker: Sticker | null = null;
	hasError = false;
	imageLoaded = false;

	created() {
		this.owner.hydrator.useData('sticker-id', this.stickerId.toString(), data => {
			if (data) {
				this.sticker = new Sticker(data);
			} else {
				this.hasError = true;
			}
		});
	}
}
