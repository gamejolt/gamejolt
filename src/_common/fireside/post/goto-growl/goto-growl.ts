import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { RawLocation } from 'vue-router';
import { Game } from '../../../game/game.model';
import { AppTimeAgo } from '../../../time/ago/ago';
import { FiresidePost } from '../post-model';

export type Action = 'add' | 'publish';

@Component({
	components: {
		AppTimeAgo,
	},
})
export default class AppFiresidePostGotoGrowl extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(String)
	action!: string;

	get isActive() {
		return this.post.status === FiresidePost.STATUS_ACTIVE;
	}

	get isScheduled() {
		return this.post.isScheduled && this.post.status === FiresidePost.STATUS_DRAFT;
	}

	get isDraft() {
		return !this.post.isScheduled && this.post.status === FiresidePost.STATUS_DRAFT;
	}

	get draftsLocation(): RawLocation {
		return this.getFeedLocation('draft');
	}

	get scheduledLocation(): RawLocation {
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

	getFeedLocation(tab: string): RawLocation {
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
		this.$emit('close');
	}

	mounted() {
		// Close this modal when the user navigates.
		this.$router.beforeResolve((_to, _from, next) => {
			this.$emit('close');
			next();
		});
	}
}
