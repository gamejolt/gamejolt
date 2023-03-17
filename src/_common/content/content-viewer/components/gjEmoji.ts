import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppEmoji from '../../../emoji/AppEmoji.vue';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerGJEmoji extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		const emoji = this.contentData.attrs.type;
		// TODO(reactions) get working
		const useNetworkAsset = !!this.contentData.attrs.src;

		return h(AppEmoji, {
			emoji,
			src: useNetworkAsset ? this.contentData.attrs.src : undefined,
			// TODO(reactions) figure out if "type" will include the colons
			title: useNetworkAsset ? emoji : `:${emoji}:`,
		});
	}
}
