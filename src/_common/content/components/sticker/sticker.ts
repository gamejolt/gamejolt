import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import AppLoading from '../../../loading/loading.vue';
import { Sticker } from '../../../sticker/sticker.model';
import { ContentOwner } from '../../content-owner';

@Component({
	components: {
		AppImgResponsive,
		AppLoading,
	},
})
export default class AppContentSticker extends Vue {
	@Prop(propRequired(Number)) stickerId!: number;
	@Prop(Object) owner!: ContentOwner;
	@Prop(Boolean) isEditing!: boolean;
	@Prop(Boolean) isDisabled!: boolean;

	sticker: Sticker | null = null;
	hasError = false;
	imageLoaded = false;

	created() {
		this.owner.getHydrator().useData('sticker-id', this.stickerId.toString(), data => {
			if (data) {
				this.sticker = new Sticker(data);
			} else {
				this.hasError = true;
			}
		});
	}
}
