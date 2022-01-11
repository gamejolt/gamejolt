import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { AppScrollTo } from '../../../../_common/scroll/to/to.directive';
import { AppSocialFacebookLike } from '../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../_common/social/twitter/share/share';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppAuthJoinLazy } from '../../../components/lazy';
import socialImage from './social.png';

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
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

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

		Meta.fb.image = Meta.twitter.image = socialImage;
	}
}
