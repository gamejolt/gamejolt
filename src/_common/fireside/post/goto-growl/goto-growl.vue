<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { RouteLocationRaw } from 'vue-router';
import { Game } from '../../../game/game.model';
import AppTimeAgo from '../../../time/AppTimeAgo.vue';
import { FiresidePost } from '../post-model';

export type Action = 'add' | 'publish' | 'scheduled-publish';

@Options({
	components: {
		AppTimeAgo,
	},
})
export default class AppFiresidePostGotoGrowl extends Vue {
	@Prop(Object)
	post!: FiresidePost;

	@Prop(String)
	action!: string;

	@Emit('close')
	emitClose() {}

	get isActive() {
		return this.post.status === FiresidePost.STATUS_ACTIVE;
	}

	get isScheduled() {
		return this.post.isScheduled && this.post.status === FiresidePost.STATUS_DRAFT;
	}

	get isDraft() {
		return !this.post.isScheduled && this.post.status === FiresidePost.STATUS_DRAFT;
	}

	get draftsLocation(): RouteLocationRaw {
		return this.getFeedLocation('draft');
	}

	get scheduledLocation(): RouteLocationRaw {
		return this.getFeedLocation('scheduled');
	}

	get hasOneCommunity() {
		return this.post.communities.length === 1;
	}

	get communityLocation() {
		const communityLink = this.post.communities[0];
		const community = this.post.communities[0].community;
		return {
			name: 'communities.view.overview',
			params: {
				path: community.path,
				channel: communityLink.channel!.title,
			},
		};
	}

	get shouldShowCommunityRedirect() {
		if (!this.hasOneCommunity) {
			return false;
		}

		const location = this.communityLocation;
		return (
			this.$route.name !== location.name ||
			this.$route.params['path'] !== location.params.path ||
			this.$route.params['channel'] !== location.params.channel
		);
	}

	getFeedLocation(tab: string): RouteLocationRaw {
		if (this.post.game instanceof Game) {
			return {
				name: 'dash.games.manage.devlog',
				params: {
					id: this.post.game.id.toString(),
				},
				query: {
					tab,
				},
			};
		} else {
			return {
				name: 'profile.overview',
				params: {
					username: this.post.user.username,
				},
				query: {
					tab,
				},
			};
		}
	}

	onClickedView() {
		// Any button clicked closes the modal.
		this.emitClose();
	}

	mounted() {
		// Close this modal when the user navigates.
		this.$router.beforeResolve((_to, _from, next) => {
			this.emitClose();
			next();
		});
	}
}
</script>

<template>
	<div>
		<h4 class="section-header">
			<span v-if="action === 'publish'">
				<AppTranslate>Your post was published!</AppTranslate>
			</span>
			<span v-else-if="action === 'scheduled-publish'">
				<AppTranslate>Your scheduled post was published!</AppTranslate>
			</span>
			<span v-else-if="isActive">
				<AppJolticon icon="share-airplane" />
				<AppTranslate>Your post was added!</AppTranslate>
			</span>
			<span v-else-if="isDraft">
				<AppJolticon icon="edit" />
				<AppTranslate>Your post was saved as a draft.</AppTranslate>
			</span>
			<span v-else>
				<AppJolticon icon="calendar-grid" />
				<AppTranslate>Your post was scheduled.</AppTranslate>
			</span>
		</h4>

		<div v-if="isScheduled">
			It's scheduled to be published automatically in
			<AppTimeAgo :date="post.scheduled_for" without-suffix />
			.
		</div>

		<div class="-controls">
			<router-link :to="post.routeLocation">
				<AppButton @click="onClickedView">
					<AppTranslate>View Post</AppTranslate>
				</AppButton>
			</router-link>
			<router-link v-if="isDraft" :to="draftsLocation">
				<AppButton @click="onClickedView">
					<AppTranslate>All Drafts</AppTranslate>
				</AppButton>
			</router-link>
			<router-link v-else-if="isScheduled" :to="scheduledLocation">
				<AppButton @click="onClickedView">
					<AppTranslate>All Scheduled Posts</AppTranslate>
				</AppButton>
			</router-link>
			<router-link v-else-if="shouldShowCommunityRedirect" :to="communityLocation">
				<AppButton @click="onClickedView">
					<AppTranslate>Go to Community</AppTranslate>
				</AppButton>
			</router-link>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-controls
	margin-top: 16px
</style>
