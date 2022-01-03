import { Options } from 'vue-property-decorator';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { AppScrollTo } from '../../../../_common/scroll/to/to.directive';
import { AppSocialFacebookLike } from '../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../_common/social/twitter/share/share';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppAuthJoinLazy } from '../../../components/lazy';

@Options({
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

	readonly assetPaths = import.meta.globEager('./*.(svg|jpg|png)');

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
