import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppEmoji from '../../../emoji/AppEmoji.vue';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerGJEmoji extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return h(AppEmoji, {
			emoji: this.contentData.attrs.type,
			title: `:${this.contentData.attrs.type}:`,
		});
	}
}
