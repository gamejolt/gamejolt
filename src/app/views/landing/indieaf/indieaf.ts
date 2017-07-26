import { Component } from 'vue-property-decorator';
import * as View from '!view!./indieaf.html?style=./indieaf.styl';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppSocialTwitterShare } from '../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { AppState, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';

@View
@Component({
	components: {
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppAuthJoin,
	},
})
export default class RouteLandingIndieaf extends BaseRouteComponent {
	@AppState user: AppStore['user'];

	state: 'bogus' | 'indie' = 'bogus';

	routeInit() {
		Meta.title = this.$gettext(`Get Indie.AF // Freakin' legit customizable game sites`);
		Meta.description = this.$gettext(
			`Build your own customizable site with an indie.af domain through Game Jolt Sites!`
		);

		Meta.fb = {
			type: 'website',
			title: Meta.title,
			description: Meta.description,
		};

		Meta.twitter = {
			card: 'summary_large_image',
			title: Meta.title,
			description: Meta.description,
		};

		Meta.fb.image = Meta.twitter.image = require('./social.png');
	}
}
