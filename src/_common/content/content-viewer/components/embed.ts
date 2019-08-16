import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppContentEmbed from '../../components/embed/embed.vue';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';

@Component({})
export class AppContentViewerEmbed extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		if (!this.data.attrs.type || !this.data.attrs.source) {
			return null;
		}
		return h(AppContentEmbed, {
			props: {
				type: this.data.attrs.type,
				source: this.data.attrs.source,
				isEditing: false,
				owner: this.owner,
			},
		});
	}
}
