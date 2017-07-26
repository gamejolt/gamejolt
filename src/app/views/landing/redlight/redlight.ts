import { Component } from 'vue-property-decorator';
import * as View from '!view!./redlight.html';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppState, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppSocialTwitterShare } from '../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

@View
@Component({
	components: {
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppJolticon,
		AppAuthJoin,
	},
})
export default class RouteLandingRedlight extends BaseRouteComponent {
	@AppState user: AppStore['user'];

	readonly slogans = [
		this.$gettext(`Drive indie traffic to your AAA games`),
		this.$gettext(`A better platform for AAA`),
		this.$gettext(`Real games for real people`),
		this.$gettext(`AAA games with indie branding`),
		this.$gettext(`You too can be indie`),
		this.$gettext(`A direct way to distribute your games and grow an audience for AAA studios`),
		this.$gettext(`Turn those AAAs to $$$s`),
		this.$gettext(`Bringing hope to AAA studios`),
		this.$gettext(`Helping AAA studios to make a name for themselves`),
		this.$gettext(`Putting the indie in AAA`),
		this.$gettext(`Roses are red, violets are blue, indies are cool, now AAAs too!`),
	];

	readonly handles = [
		'Blizzard_Ent',
		'SquareEnix',
		'Konami',
		'Capcom_Unity',
		'Ubisoft',
		'Activision',
		'CDPROJEKTRED',
		'SNKPofficial',
		'NISAmerica',
		'EA',
		'Rebellion',
		'InfinityWard',
		'SHGames',
		'riotgames',
		'Bungie',
	];

	readonly slogan = this.slogans[getRandomInt(0, this.slogans.length)];
	readonly chosenHandle = this.handles[getRandomInt(0, this.handles.length)];
	readonly tweet = this.$gettextInterpolate(
		`Hey %{ handle }! I think your games would be a good fit for Game Jolt #redlight #gamedev`,
		{
			handle: `@${this.chosenHandle}`,
		}
	);

	readonly Screen = makeObservableService(Screen);

	routeInit() {
		Meta.title = this.$gettext(`Redlight`);
		Meta.description = this.$gettext(`A unique platform for AAA studios and non-indie publishers.`);

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
