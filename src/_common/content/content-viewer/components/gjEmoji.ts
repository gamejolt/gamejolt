import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';

@Component({})
export class AppContentViewerGJEmoji extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		const style = {} as any;

		if (this.owner.getContentRules().biggifyEmojis) {
			// If the content is entirely just one gj Emoji, double its size.
			const content = this.owner.getContent();
			if (content && content.getLength() === this.data.getLength()) {
				style['width'] = '50px';
				style['height'] = '40px';
				style['background-size'] = 'cover';
			}
		}

		return h('span', {
			class: 'emoji emoji-' + this.data.attrs.type,
			attrs: { title: `:${this.data.attrs.type}:` },
			style,
		});
	}
}
