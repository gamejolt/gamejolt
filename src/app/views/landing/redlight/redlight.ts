import { Options } from 'vue-property-decorator';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { AppSocialFacebookLike } from '../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../_common/social/twitter/share/share';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppAuthJoinLazy } from '../../../components/lazy';
import socialImage from './social.png';

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

@Options({
	name: 'RouteLandingRedlight',
	components: {
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppAuthJoin: AppAuthJoinLazy,
	},
})
export default class RouteLandingRedlight extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

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
	readonly tweet = `Hey @${this.chosenHandle}! I think your games would be a good fit for Game Jolt #redlight #gamedev`;
	readonly assetPaths = import.meta.globEager('./*.(svg|png)');

	readonly Screen = Screen;

	get routeTitle() {
		return `Redlight`;
	}

	routeCreated() {
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

		Meta.fb.image = Meta.twitter.image = socialImage;
	}
}
