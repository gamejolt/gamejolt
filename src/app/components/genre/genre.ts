import Vue from 'vue';

const translator = new Vue();

export class Genre
{
	static get genres()
	{
		return {
			action: {
				label: translator.$gettext( 'Action' ),
				img: require( '../channel/action.png' ),
				url: 'action',
			},
			adventure: {
				label: translator.$gettext( 'Adventure' ),
				img: require( '../channel/adventure.png' ),
				url: 'adventure',
			},
			arcade: {
				label: translator.$gettext( 'Arcade' ),
				img: require( '../channel/arcade.png' ),
				url: 'arcade',
			},
			platformer: {
				label: translator.$gettext( 'Platformer' ),
				img: require( '../channel/platformer.png' ),
				url: 'platformer',
			},
			puzzle: {
				label: translator.$gettext( 'Puzzle' ),
				img: require( '../channel/puzzle.png' ),
				url: 'puzzle',
			},
			rpg: {
				label: translator.$gettext( 'RPGs' ),
				img: require( '../channel/rpg.png' ),
				url: 'rpg',
			},
			shooter: {
				label: translator.$gettext( 'Shooter' ),
				img: require( '../channel/shooter.png' ),
				url: 'shooter',
			},
			sports: {
				label: translator.$gettext( 'Sports' ),
				img: require( '../channel/sports.png' ),
				url: 'sports',
			},
			'strategy-sim': {
				label: translator.$gettext( 'Strategy/Sim' ),
				img: require( '../channel/strategysim.png' ),
				url: 'strategy-sim',
			},
			other: {
				label: translator.$gettext( 'Other' ),
				img: require( '../channel/other.png' ),
				url: 'other',
			},
		};
	}
}
