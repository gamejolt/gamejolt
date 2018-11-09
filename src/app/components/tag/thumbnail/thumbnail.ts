import View from '!view!./thumbnail.html?style=./thumbnail.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Location } from 'vue-router';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { TagsInfo } from '../tags-info.service';

@View
@Component({
	directives: {
		AppTrackEvent,
	},
})
export class AppTagThumbnail extends Vue {
	@Prop(String)
	tag!: string;

	get tagInfo() {
		return TagsInfo.tags.find(i => i.id === this.tag)!;
	}

	get location(): Location {
		return {
			name: 'discover.games.list._fetch-tag',
			params: {
				section:
					typeof this.$route.params.section === 'undefined'
						? 'best'
						: this.$route.params.section,
				tag: this.tag,
			},
			query: Object.assign({}, this.$route.query, { page: undefined }),
		};
	}
}
