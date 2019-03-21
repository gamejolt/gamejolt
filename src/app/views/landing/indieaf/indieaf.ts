import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { AppScrollTo } from 'game-jolt-frontend-lib/components/scroll/to/to.directive';
import { AppSocialFacebookLike } from 'game-jolt-frontend-lib/components/social/facebook/like/like';
import { AppSocialTwitterShare } from 'game-jolt-frontend-lib/components/social/twitter/share/share';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { AppAuthJoinLazy } from '../../../components/lazy';

@Component({
	name: 'RouteLandingIndieaf',
	components: {
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppAuthJoin: AppAuthJoinLazy,
	},
	directives: {
		AppScrollTo,
	},
})
export default class RouteLandingIndieaf extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	state: 'bogus' | 'indie' = 'bogus';

	get routeTitle() {
		return `Get Indie.AF // Freakin' legit customizable game sites`;
	}

	routeCreated() {
		Meta.description = `Build your own customizable site with an indie.af domain through Game Jolt Sites!`;

		Meta.fb = {
			type: 'website',
			title: this.routeTitle,
			description: Meta.description,
		};

		Meta.twitter = {
			card: 'summary_large_image',
			title: this.routeTitle,
			description: Meta.description,
		};

		Meta.fb.image = Meta.twitter.image = require('./social.png');
	}
}
