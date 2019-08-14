import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import AppContentMediaItem from '../media-item/media-item.vue';

@Component({})
export class AppContentViewerMediaItem extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(AppContentMediaItem, {
			props: {
				mediaItemId: this.data.attrs.id,
				mediaItemWidth: this.data.attrs.width,
				mediaItemHeight: this.data.attrs.height,
				caption: this.data.attrs.caption,
				align: this.data.attrs.align,
				href: this.data.attrs.href,
				isEditing: false,
				owner: this.owner,
			},
		});
	}
}
