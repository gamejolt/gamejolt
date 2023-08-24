<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { RouteLocationRaw } from 'vue-router';
import { GameModel } from '../../../game/game.model';
import AppTimeAgo from '../../../time/AppTimeAgo.vue';
import { FiresidePostModel, FiresidePostStatus } from '../post-model';

export type Action = 'add' | 'publish' | 'scheduled-publish';

@Options({
	components: {
		AppTimeAgo,
	},
})
export default class AppFiresidePostGotoGrowl extends Vue {
	@Prop(Object)
	post!: FiresidePostModel;

	@Prop(String)
	action!: string;

	@Emit('close')
	emitClose() {}

	get isActive() {
		return this.post.status === FiresidePostStatus.Active;
	}

	get isScheduled() {
		return this.post.isScheduled && this.post.status === FiresidePostStatus.Draft;
	}

	get isDraft() {
		return !this.post.isScheduled && this.post.status === FiresidePostStatus.Draft;
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
		if (this.post.game instanceof GameModel) {
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
				{{ $gettext(`Your post was published!`) }}
			</span>
			<span v-else-if="action === 'scheduled-publish'">
				{{ $gettext(`Your scheduled post was published!`) }}
			</span>
			<span v-else-if="isActive">
				<AppJolticon icon="share-airplane" />
				{{ $gettext(`Your post was added!`) }}
			</span>
			<span v-else-if="isDraft">
				<AppJolticon icon="edit" />
				{{ $gettext(`Your post was saved as a draft.`) }}
			</span>
			<span v-else>
				<AppJolticon icon="calendar-grid" />
				{{ $gettext(`Your post was scheduled.`) }}
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
					{{ $gettext(`View Post`) }}
				</AppButton>
			</router-link>
			{{ ' ' }}
			<router-link v-if="isDraft" :to="draftsLocation">
				<AppButton @click="onClickedView">
					{{ $gettext(`All Drafts`) }}
				</AppButton>
			</router-link>
			<router-link v-else-if="isScheduled" :to="scheduledLocation">
				<AppButton @click="onClickedView">
					{{ $gettext(`All Scheduled Posts`) }}
				</AppButton>
			</router-link>
			<router-link v-else-if="shouldShowCommunityRedirect" :to="communityLocation">
				<AppButton @click="onClickedView">
					{{ $gettext(`Go to Community`) }}
				</AppButton>
			</router-link>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-controls
	margin-top: 16px
</style>
