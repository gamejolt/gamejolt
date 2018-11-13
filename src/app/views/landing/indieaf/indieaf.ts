import View from '!view!./indieaf.html?style=./indieaf.styl';
import { Component } from 'vue-property-decorator';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppScrollTo } from '../../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { AppSocialFacebookLike } from '../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppState, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppAuthJoinLazy } from '../../../components/lazy';

@View
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
