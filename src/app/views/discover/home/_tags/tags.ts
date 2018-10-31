import View from '!view!./tags.html?style=./tags.styl';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { AppScrollScroller } from 'game-jolt-frontend-lib/components/scroll/scroller/scroller';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Channels } from '../../../../components/channel/channels-service';
import { AppChannelThumbnail } from '../../../../components/channel/thumbnail/thumbnail';

const FeaturedChannels = [
	'action',
	'horror',
	'adventure',
	'fangame',
	'rpg',
	'multiplayer',
	'platformer',
	'survival',
	'retro',
	'shooter',
	'vr',
	'strategy-sim',
	'fnaf',
];

@View
@Component({
	components: {
		AppScrollScroller,
		AppChannelThumbnail,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppDiscoverHomeTags extends Vue {
	get channels() {
		const channels = [];
		for (const channel of FeaturedChannels) {
			const info = Channels.channels.find(i => i.id === channel);
			if (info) {
				channels.push(info);
			}
		}

		return channels;
	}
}
