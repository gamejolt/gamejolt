import { Options, Prop, Vue } from 'vue-property-decorator';
import { RouteLocationDefinition } from '../../../../utils/router';
import { TagsInfo } from '../tags-info.service';

@Options({})
export default class AppTagThumbnail extends Vue {
	@Prop({ type: String, required: true }) tag!: string;
	@Prop({ type: String, default: 'global' }) eventCat!: string;

	get tagInfo() {
		return TagsInfo.tags.find(i => i.id === this.tag)!;
	}

	get location(): RouteLocationDefinition {
		return {
			name: 'discover.games.list._fetch-tag',
			params: {
				section: this.$route.params.section || (null as any),
				tag: this.tag,
			},
			query: Object.assign({}, this.$route.query, { page: undefined }),
		};
	}

	get active() {
		return (
			this.$route.name === 'discover.games.list._fetch-tag' &&
			this.$route.params.tag === this.tag
		);
	}

	get event() {
		return `${this.eventCat || 'global'}:tag-list:${this.tagInfo.id}`;
	}
}