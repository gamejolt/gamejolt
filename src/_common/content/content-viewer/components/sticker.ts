import Vue, { CreateElement } from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import AppContentSticker from '../../components/sticker/sticker.vue';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';

@Component({})
export class AppContentViewerSticker extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(AppContentSticker, {
			key: this.data.attrs.id.toString(),
			props: {
				stickerId: this.data.attrs.id,
				isEditing: false,
				owner: this.owner,
			},
		});
	}
}
