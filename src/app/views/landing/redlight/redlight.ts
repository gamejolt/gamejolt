import { Component } from 'vue-property-decorator';
import * as View from '!view!./redlight.html?style=./redlight.styl';

import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppState, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppSocialTwitterShare } from '../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthJoinLazy } from '../../../components/lazy';

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

@View
@Component({
	name: 'RouteLandingRedlight',
	components: {
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppJolticon,
		AppAuthJoin: AppAuthJoinLazy,
	},
})
export default class RouteLandingRedlight extends BaseRouteComponent {
	@AppState user: AppStore['user'];

	readonly slogans = [
		`Drive indie traffic to your AAA games`,
		`A better platform for AAA`,
		`Real games for real people`,
		`AAA games with indie branding`,
		`You too can be indie`,
		`A direct way to distribute your games and grow an audience for AAA studios`,
		`Turn those AAAs to $$$s`,
		`Bringing hope to AAA studios`,
		`Helping AAA studios to make a name for themselves`,
		`Putting the indie in AAA`,
		`Roses are red, violets are blue, indies are cool, now AAAs too!`,
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
	readonly tweet = `Hey @${this
		.chosenHandle}! I think your games would be a good fit for Game Jolt #redlight #gamedev`;

	readonly Screen = makeObservableService(Screen);

	get routeTitle() {
		return `Redlight`;
	}

	routeInit() {
		Meta.description = `A unique platform for AAA studios and non-indie publishers.`;

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
