import { Options, Prop, Vue } from 'vue-property-decorator';
import AppPostCardPlaceholder from '../../../app/components/fireside/post/card/card-placeholder.vue';
import AppPostCard from '../../../app/components/fireside/post/card/card.vue';
import { propRequired } from '../../../utils/vue';
import { PostOpenSource, trackGotoCommunity } from '../../analytics/analytics.service';
import { Api } from '../../api/api.service';
import { EventItem } from '../../event-item/event-item.model';
import { formatNumber } from '../../filters/number';
import AppMediaItemBackdrop from '../../media-item/backdrop/backdrop.vue';
import { Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
import { Community } from '../community.model';
import AppCommunityJoinWidget from '../join-widget/join-widget.vue';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Options({
	components: {
		AppCommunityThumbnailImg,
		AppMediaItemBackdrop,
		AppCommunityJoinWidget,
		AppPostCard,
		AppCommunityVerifiedTick,
		AppPostCardPlaceholder,
		AppScrollScroller,
	},
})
export default class AppCommunityChunk extends Vue {
	@Prop(propRequired(Community)) community!: Community;

	items: EventItem[] = [];
	isLoadingPosts = true;

	readonly formatNumber = formatNumber;
	readonly Screen = Screen;
	readonly preferredCardsPerRow = 5;
	readonly postOpenSource: PostOpenSource = 'communityChunk';

	mounted() {
		this.fetchFeed();
	}

	private async fetchFeed() {
		const sort = 'hot';
		const payload = await Api.sendRequest(
			`/web/communities/overview/${this.community.path}/featured?sort=${sort}&perPage=10`
		);
		this.items = EventItem.populate(payload.items);
		this.isLoadingPosts = false;
	}

	trackGotoCommunity() {
		trackGotoCommunity({
			source: 'communityChunk',
			id: this.community.id,
			path: this.community.path,
		});
	}
}
