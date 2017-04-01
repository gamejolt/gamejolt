import { Component, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./redlight.component.html';
import '../../../styles/pages/redlight.styl';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { App } from '../../../app-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';

function getRandomInt( min: number, max: number )
{
	min = Math.ceil( min );
	max = Math.floor( max );
	return Math.floor( Math.random() * (max - min) ) + min;
}

const slogans = [
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

const handles = [
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

const chosenHandle = handles[ getRandomInt( 0, handles.length ) ];

@Component({
	selector: 'route-landing-redlight',
	template,
})
export class RouteRedlightComponent
{
	slogan = slogans[ getRandomInt( 0, slogans.length ) ];
	tweet = `Hey @${chosenHandle}! I think your games would be a good fit for Game Jolt #redlight #gamedev`;

	Screen = Screen;

	constructor(
		@Inject( 'App' ) public app: App,
	)
	{
		Meta.title = `Redlight`;
		Meta.description = `A unique platform for AAA studios and non-indie publishers.`;

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

		Meta.fb.image = Meta.twitter.image = require( './social.png' );
	}
}
