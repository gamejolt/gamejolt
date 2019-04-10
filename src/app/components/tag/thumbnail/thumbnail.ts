import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Location } from 'vue-router';
import { TagsInfo } from '../tags-info.service';

@Component({
	directives: {
		AppTrackEvent,
	},
})
export default class AppTagThumbnail extends Vue {
	@Prop(String)
	tag!: string;

	get tagInfo() {
		return TagsInfo.tags.find(i => i.id === this.tag)!;
	}

	get location(): Location {
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
			this.$route.name === 'discover.games.list._fetch-tag' && this.$route.params.tag === this.tag
		);
	}
}
