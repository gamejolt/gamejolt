export interface TagInfo {
	id: string;
	label: string;
	image: string;
}

export class TagsInfo {
	static readonly tags: TagInfo[] = [
		{
			id: 'fnaf',
			label: '#fnaf',
			image: require('./images/fnaf.png'),
		},
		{
			id: 'horror',
			label: '#horror',
			image: require('./images/horror.png'),
		},
		{
			id: 'fangame',
			label: '#fangame',
			image: require('./images/fangame.png'),
		},
		{
			id: 'analog',
			label: '#analog',
			image: require('./images/analog.png'),
		},
		{
			id: 'multiplayer',
			label: '#multiplayer',
			image: require('./images/multiplayer.png'),
		},
		{
			id: 'vr',
			label: '#vr',
			image: require('./images/vr.png'),
		},
		{
			id: 'altgame',
			label: '#altgame',
			image: require('./images/altgame.png'),
		},
		{
			id: 'pointnclick',
			label: '#pointnclick',
			image: require('./images/pointnclick.png'),
		},
		{
			id: 'retro',
			label: '#retro',
			image: require('./images/retro.png'),
		},
		{
			id: 'roguelike',
			label: '#roguelike',
			image: require('./images/roguelike.png'),
		},
		{
			id: 'scifi',
			label: '#scifi',
			image: require('./images/scifi.png'),
		},
		{
			id: 'survival',
			label: '#survival',
			image: require('./images/survival.png'),
		},
		{
			id: 'textadventure',
			label: '#textadventure',
			image: require('./images/textadventure.png'),
		},
		{
			id: 'action',
			label: '#action',
			image: require('./images/action.png'),
		},
		{
			id: 'adventure',
			label: '#adventure',
			image: require('./images/adventure.png'),
		},
		{
			id: 'arcade',
			label: '#arcade',
			image: require('./images/arcade.png'),
		},
		{
			id: 'platformer',
			label: '#platformer',
			image: require('./images/platformer.png'),
		},
		{
			id: 'puzzle',
			label: '#puzzle',
			image: require('./images/puzzle.png'),
		},
		{
			id: 'rpg',
			label: '#rpg',
			image: require('./images/rpg.png'),
		},
		{
			id: 'shooter',
			label: '#shooter',
			image: require('./images/shooter.png'),
		},
		{
			id: 'sports',
			label: '#sports',
			image: require('./images/sports.png'),
		},
		{
			id: 'strategy',
			label: '#strategy',
			image: require('./images/strategysim.png'),
		},
		{
			id: 'other',
			label: '#other',
			image: require('./images/other.png'),
		},
	];
}
