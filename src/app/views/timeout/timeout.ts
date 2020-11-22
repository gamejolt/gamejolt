import Component from 'vue-class-component';
import { LocationRedirect } from '../../../utils/router';
import { Api } from '../../../_common/api/api.service';
import { Comment } from '../../../_common/comment/comment-model';
import AppCommunityCard from '../../../_common/community/card/card.vue';
import { Community } from '../../../_common/community/community.model';
import AppContactLink from '../../../_common/contact-link/contact-link.vue';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { Game } from '../../../_common/game/game.model';
import AppGameThumbnail from '../../../_common/game/thumbnail/thumbnail.vue';
import { Growls } from '../../../_common/growls/growls.service';
import AppLinkHelp from '../../../_common/link/help/help.vue';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { AppMutation, AppState, appStore, AppStore } from '../../../_common/store/app-store';
import { AppThemeSvg } from '../../../_common/theme/svg/svg';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import { UserTimeout } from '../../../_common/user/timeout/timeout.model';
import AppTimeoutResourcesComment from './_resources/comment/comment.vue';
import AppTimeoutResourcesPost from './_resources/post/post.vue';

@Component({
	name: 'RouteTimeout',
	components: {
		AppThemeSvg,
		AppTimeAgo,
		AppLinkHelp,
		AppContactLink,
		AppTimeoutResourcesComment,
		AppTimeoutResourcesPost,
		AppGameThumbnail,
		AppCommunityCard,
	},
})
@RouteResolver({
	resolver: async () => {
		const payload = await Api.sendRequest('/web/touch');

		// Redirect to home for guests or users without active timeouts.
		if (!!appStore.user || !appStore.state.isUserTimedOut) {
			return new LocationRedirect({
				name: 'home',
			});
		}

		return payload;
	},
})
export default class RouteTimeout extends BaseRouteComponent {
	@AppState
	timeout!: AppStore['timeout'];

	@AppMutation
	setTimeout!: AppStore['setTimeout'];

	isExpired = false;
	updateTimer?: NodeJS.Timer;
	isClearingResource = false;

	get routeTitle() {
		return this.$gettext('You have been timed out');
	}

	get isActive() {
		return this.timeout?.getIsActive();
	}

	get resourceIsComment() {
		return this.timeout?.resource instanceof Comment;
	}

	get resourceIsGame() {
		return this.timeout?.resource instanceof Game;
	}

	get resourceIsCommunity() {
		return this.timeout?.resource instanceof Community;
	}

	get resourceIsPost() {
		return this.timeout?.resource instanceof FiresidePost;
	}

	mounted() {
		this.updateTimer = setInterval(this.updateExpired, 100);
	}

	updateExpired() {
		if (this.timeout) {
			this.isExpired = this.timeout.getIsExpired();
		} else {
			this.isExpired = true;
		}
	}

	async onClickClearResource() {
		this.isClearingResource = true;

		const payload = await Api.sendRequest('/web/dash/timeout/clear-resource', {});
		if (payload && payload.success) {
			const newTimeout = new UserTimeout(payload.timeout);
			this.setTimeout(newTimeout);

			this.updateExpired();
			Growls.info(this.$gettext(`The resource has been removed.`));
		} else {
			Growls.error(this.$gettext(`Failed to clear timeout resource.`));
		}

		this.isClearingResource = false;
	}
}
