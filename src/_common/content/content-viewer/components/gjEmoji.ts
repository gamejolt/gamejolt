import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentEmoji from '../../components/AppContentEmoji.vue';
import { ContentObject } from '../../content-object';

@Options({})
export class AppContentViewerGJEmoji extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		const { id, type } = this.contentData.attrs;

		return h(AppContentEmoji, {
			emojiId: id,
			emojiType: type,
		});
	}
}
