<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatFuzzynumber } from '../../filters/fuzzynumber';
import { formatNumber } from '../../filters/number';
import AppLoading from '../../loading/loading.vue';
import { useCommonStore } from '../../store/common-store';
import AppTheme from '../../theme/AppTheme.vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import AppUserFollowWidget from '../follow/widget.vue';
import AppUserAvatarImg from '../user-avatar/img/img.vue';
import { User } from '../user.model';
import AppUserVerifiedTick from '../verified-tick/verified-tick.vue';

@Options({
	components: {
		AppUserAvatarImg,
		AppUserFollowWidget,
		AppTheme,
		AppLoading,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppUserCard extends Vue {
	@Prop({ type: Object, required: true }) user!: User;
	@Prop({ type: Boolean, default: false }) isLoading!: boolean;
	@Prop({ type: Boolean, default: false }) elevate!: boolean;

	@Prop({ type: Boolean })
	noStats!: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	readonly formatNumber = formatNumber;
	readonly formatFuzzynumber = formatFuzzynumber;

	get followerCount() {
		return this.user.follower_count || 0;
	}

	get followingCount() {
		return this.user.following_count || 0;
	}

	get postCount() {
		return this.user.post_count || 0;
	}

	get gameCount() {
		return this.user.game_count || 0;
	}

	get likeCount() {
		return this.user.like_count || 0;
	}

	get headerBackgroundImage() {
		return this.user.header_media_item
			? `url('${this.user.header_media_item.mediaserver_url}')`
			: undefined;
	}
}
</script>

<template>
	<app-theme
		class="user-card sheet sheet-full sheet-no-full-bleed"
		:class="{ 'sheet-elevate': elevate }"
		:theme="user.theme"
	>
		<div class="-user-info">
			<div
				class="-header"
				:style="{
					'background-image': headerBackgroundImage,
				}"
			/>

			<router-link :to="user.url" class="-avatar">
				<app-user-avatar-img :user="user" />
			</router-link>

			<div class="-well fill-bg">
				<div v-if="user.follows_you" class="-follows-you">
					<span class="tag">
						<translate>Follows You</translate>
					</span>
				</div>

				<div class="-display-name">
					<router-link :to="user.url" class="link-unstyled">
						{{ user.display_name }}
						<app-user-verified-tick :user="user" />
					</router-link>
				</div>

				<div class="-username">
					<router-link :to="user.url" class="link-unstyled">
						@{{ user.username }}
					</router-link>
				</div>

				<div class="-follow-counts small">
					<router-link
						v-translate="{ count: formatNumber(followingCount || 0) }"
						:to="{
							name: 'profile.following',
							params: { username: user.username },
						}"
						:translate-n="followingCount"
						translate-plural="<b>%{count}</b> following"
					>
						<b>1</b>
						following
					</router-link>
					<span class="dot-separator" />
					<router-link
						v-translate="{ count: formatNumber(followerCount) }"
						:to="{
							name: 'profile.followers',
							params: { username: user.username },
						}"
						:translate-n="followerCount"
						translate-plural="<b>%{count}</b> followers"
					>
						<b>1</b>
						follower
					</router-link>
				</div>

				<div v-if="app.user" class="-follow">
					<app-user-follow-widget
						v-if="user.id !== app.user.id"
						:user="user"
						location="card"
						block
						hide-count
					/>
					<app-button
						v-else
						:to="{
							name: 'profile.overview',
							params: { username: app.user.username },
						}"
						block
					>
						<translate>View Profile</translate>
					</app-button>
				</div>
			</div>
		</div>

		<div v-if="!noStats" class="-stats -well">
			<app-loading v-if="isLoading" class="sans-margin" centered />
			<ul v-else class="stat-list">
				<li class="stat-big stat-big-smaller">
					<router-link
						class="link-unstyled"
						:to="{
							name: 'profile.overview',
							params: { username: user.username },
						}"
					>
						<div class="stat-big-label">
							<translate>Posts</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(postCount) }}
						</div>
					</router-link>
				</li>
				<li v-if="gameCount" class="stat-big stat-big-smaller">
					<router-link
						class="link-unstyled"
						:to="{
							name: 'library.collection.developer',
							params: { id: user.username },
						}"
					>
						<div class="stat-big-label">
							<translate>Games</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(gameCount) }}
						</div>
					</router-link>
				</li>
				<li v-if="likeCount" class="stat-big stat-big-smaller">
					<router-link
						class="link-unstyled"
						:to="{
							name: 'profile.overview',
							params: { username: user.username },
						}"
					>
						<div class="stat-big-label">
							<translate>Likes</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatFuzzynumber(likeCount) }}
						</div>
					</router-link>
				</li>
			</ul>
		</div>
	</app-theme>
</template>

<style lang="stylus" src="./card.styl" scoped></style>
