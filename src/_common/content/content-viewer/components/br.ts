import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';

@Options({})
export class AppContentViewerHardBreak extends Vue {
	@Prop(ContentObject)
	contentData!: ContentObject;

	@Prop(Object)
	owner!: ContentOwner;

	render() {
		return h('br');
	}
}
