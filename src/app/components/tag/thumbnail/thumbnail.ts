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
}
