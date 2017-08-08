import { Translate } from '../../../lib/gj-lib-client/components/translate/translate.service';

export interface ChannelInfo {
	type: 'channel' | 'genre';
	id: string;
	label: string;
	image: string;
}

export class Channels {
	static get channels(): ChannelInfo[] {
		return [
			{
				type: 'channel',
				id: 'fnaf',
				label: '#fnaf',
				image: require('./fnaf.png'),
			},
			{
				type: 'channel',
				id: 'horror',
				label: '#horror',
				image: require('./horror.png'),
			},
			{
				type: 'channel',
				id: 'fangame',
				label: '#fangame',
				image: require('./fangame.png'),
			},
			{
				type: 'channel',
				id: 'analog',
				label: '#analog',
				image: require('./analog.png'),
			},
			{
				type: 'channel',
				id: 'multiplayer',
				label: '#multiplayer',
				image: require('./multiplayer.png'),
			},
			{
				type: 'channel',
				id: 'vr',
				label: '#vr',
				image: require('./vr.png'),
			},
			{
				type: 'channel',
				id: 'altgame',
				label: '#altgame',
				image: require('./altgame.png'),
			},
			{
				type: 'channel',
				id: 'pointnclick',
				label: '#pointnclick',
				image: require('./pointnclick.png'),
			},
			{
				type: 'channel',
				id: 'retro',
				label: '#retro',
				image: require('./retro.png'),
			},
			{
				type: 'channel',
				id: 'roguelike',
				label: '#roguelike',
				image: require('./roguelike.png'),
			},
			{
				type: 'channel',
				id: 'scifi',
				label: '#scifi',
				image: require('./scifi.png'),
			},
			{
				type: 'channel',
				id: 'survival',
				label: '#survival',
				image: require('./survival.png'),
			},
			{
				type: 'channel',
				id: 'textadventure',
				label: '#textadventure',
				image: require('./textadventure.png'),
			},
			{
				type: 'genre',
				id: 'action',
				label: Translate.$gettext('Action'),
				image: require('./action.png'),
			},
			{
				type: 'genre',
				id: 'adventure',
				label: Translate.$gettext('Adventure'),
				image: require('./adventure.png'),
			},
			{
				type: 'genre',
				id: 'arcade',
				label: Translate.$gettext('Arcade'),
				image: require('./arcade.png'),
			},
			{
				type: 'genre',
				id: 'platformer',
				label: Translate.$gettext('Platformer'),
				image: require('./platformer.png'),
			},
			{
				type: 'genre',
				id: 'puzzle',
				label: Translate.$gettext('Puzzle'),
				image: require('./puzzle.png'),
			},
			{
				type: 'genre',
				id: 'rpg',
				label: Translate.$gettext('RPG'),
				image: require('./rpg.png'),
			},
			{
				type: 'genre',
				id: 'shooter',
				label: Translate.$gettext('Shooter'),
				image: require('./shooter.png'),
			},
			{
				type: 'genre',
				id: 'sports',
				label: Translate.$gettext('Sports'),
				image: require('./sports.png'),
			},
			{
				type: 'genre',
				id: 'strategy-sim',
				label: Translate.$gettext('Strategy/Sim'),
				image: require('./strategysim.png'),
			},
			{
				type: 'genre',
				id: 'other',
				label: Translate.$gettext('Other'),
				image: require('./other.png'),
			},
		];
	}
}
