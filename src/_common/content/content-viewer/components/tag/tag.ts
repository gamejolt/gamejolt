import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentOwner } from '../../../content-owner';

@Options({})
export default class AppContentViewerTag extends Vue {
	@Prop(String)
	tag!: string;

	@Prop(Object)
	owner!: ContentOwner;

	get url() {
		const searchTerm = encodeURIComponent(`#${this.tag}`);
		return `/search?q=${searchTerm}`;
	}
}
