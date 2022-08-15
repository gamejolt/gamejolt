<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { PostOpenSource, trackGotoCommunity } from '../../analytics/analytics.service';
import { Api } from '../../api/api.service';
import { EventItem } from '../../event-item/event-item.model';
import { formatNumber } from '../../filters/number';
import AppPostCard from '../../fireside/post/card/AppPostCard.vue';
import AppPostCardPlaceholder from '../../fireside/post/card/AppPostCardPlaceholder.vue';
import { Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import { Community } from '../community.model';
import AppCommunityJoinWidget from '../join-widget/join-widget.vue';
import AppCommunityThumbnailImg from '../thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Options({
	components: {
		AppCommunityThumbnailImg,
		AppCommunityJoinWidget,
		AppCommunityVerifiedTick,
		AppPostCard,
		AppPostCardPlaceholder,
		AppScrollScroller,
	},
})
export default class AppCommunityChunk extends Vue {
	@Prop({ type: Object, required: true }) community!: Community;

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
			`/web/communities/overview/${this.community.path}/featured?sort=${sort}&perPage=10`,
			{},
			{ detach: true }
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
</script>

<template>
	<div class="community-chunk">
		<div class="-header">
			<router-link
				class="-header-lead"
				:to="community.routeLocation"
				@click="trackGotoCommunity()"
			>
				<div class="-thumbnail">
					<div class="-thumbnail-inner">
						<AppCommunityThumbnailImg :community="community" />
					</div>

					<AppCommunityVerifiedTick
						class="-thumbnail-verified"
						:community="community"
						no-tooltip
					/>
				</div>

				<div class="-header-details">
					<div class="-header-name">
						{{ community.name }}
					</div>

					<div
						v-translate="{ count: formatNumber(community.member_count) }"
						class="-header-members"
						:translate-n="community.member_count"
						translate-plural="<b>%{count}</b> members"
					>
						<b>1</b>
						member
					</div>
				</div>
			</router-link>

			<div class="-header-button">
				<AppButton
					:to="community.routeLocation"
					outline
					primary
					@click="trackGotoCommunity()"
				>
					<AppTranslate> View Community </AppTranslate>
				</AppButton>
			</div>
		</div>

		<component
			:is="Screen.isXs ? 'app-scroll-scroller' : 'div'"
			:horizontal="Screen.isXs"
			:thin="Screen.isXs"
		>
			<div class="-content" :class="{ '-scrollable': Screen.isXs }">
				<template v-if="isLoadingPosts">
					<template v-for="(item, index) of preferredCardsPerRow" :key="item">
						<div class="-card">
							<AppPostCardPlaceholder />
						</div>

						<div
							:class="{
								'-spacer': index + 1 < preferredCardsPerRow,
								'-spacer-large': index + 1 === preferredCardsPerRow && Screen.isXs,
							}"
						/>
					</template>
				</template>
				<template v-else-if="items.length > 0">
					<template v-for="(item, index) of items" :key="item.id">
						<div class="-card">
							<AppPostCard :post="item.action" :source="postOpenSource" with-user />
						</div>

						<div
							:class="{
								'-spacer': index + 1 < preferredCardsPerRow,
								'-spacer-large': index + 1 === preferredCardsPerRow && Screen.isXs,
							}"
						/>
					</template>

					<!-- Add empty flexible items if we haven't met our preferred items per row -->
					<template v-if="items.length < preferredCardsPerRow && !Screen.isXs">
						<template
							v-for="(item, index) of preferredCardsPerRow - items.length"
							:key="item"
						>
							<div class="-card" />

							<div
								:class="{
									'-spacer': index + 1 < preferredCardsPerRow,
									'-spacer-large':
										index + 1 === preferredCardsPerRow && Screen.isXs,
								}"
							/>
						</template>
					</template>
				</template>
			</div>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
@import './chunk'
</style>
