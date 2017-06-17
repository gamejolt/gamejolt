import { Translate } from '../../../lib/gj-lib-client/components/translate/translate.service';

export class Genre {
	static get genres() {
		return {
			action: {
				label: Translate.$gettext('Action'),
				img: require('../channel/action.png'),
				url: 'action',
			},
			adventure: {
				label: Translate.$gettext('Adventure'),
				img: require('../channel/adventure.png'),
				url: 'adventure',
			},
			arcade: {
				label: Translate.$gettext('Arcade'),
				img: require('../channel/arcade.png'),
				url: 'arcade',
			},
			platformer: {
				label: Translate.$gettext('Platformer'),
				img: require('../channel/platformer.png'),
				url: 'platformer',
			},
			puzzle: {
				label: Translate.$gettext('Puzzle'),
				img: require('../channel/puzzle.png'),
				url: 'puzzle',
			},
			rpg: {
				label: Translate.$gettext('RPGs'),
				img: require('../channel/rpg.png'),
				url: 'rpg',
			},
			shooter: {
				label: Translate.$gettext('Shooter'),
				img: require('../channel/shooter.png'),
				url: 'shooter',
			},
			sports: {
				label: Translate.$gettext('Sports'),
				img: require('../channel/sports.png'),
				url: 'sports',
			},
			'strategy-sim': {
				label: Translate.$gettext('Strategy/Sim'),
				img: require('../channel/strategysim.png'),
				url: 'strategy-sim',
			},
			other: {
				label: Translate.$gettext('Other'),
				img: require('../channel/other.png'),
				url: 'other',
			},
		};
	}
}
