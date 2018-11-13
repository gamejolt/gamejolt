export interface TagInfo {
	id: string;
	label: string;
	image: string;
	imageSocial: string;
}

export class TagsInfo {
	static readonly tags: TagInfo[] = [
		{
			id: 'fnaf',
			label: '#fnaf',
			image: require('./images/fnaf.png'),
			imageSocial: require('./images/fnaf-social.png'),
		},
		{
			id: 'horror',
			label: '#horror',
			image: require('./images/horror.png'),
			imageSocial: require('./images/horror-social.png'),
		},
		{
			id: 'fangame',
			label: '#fangame',
			image: require('./images/fangame.png'),
			imageSocial: require('./images/fangame-social.png'),
		},
		{
			id: 'analog',
			label: '#analog',
			image: require('./images/analog.png'),
			imageSocial: require('./images/analog-social.png'),
		},
		{
			id: 'multiplayer',
			label: '#multiplayer',
			image: require('./images/multiplayer.png'),
			imageSocial: require('./images/multiplayer-social.png'),
		},
		{
			id: 'vr',
			label: '#vr',
			image: require('./images/vr.png'),
			imageSocial: require('./images/vr-social.png'),
		},
		{
			id: 'altgame',
			label: '#altgame',
			image: require('./images/altgame.png'),
			imageSocial: require('./images/altgame-social.png'),
		},
		{
			id: 'pointnclick',
			label: '#pointnclick',
			image: require('./images/pointnclick.png'),
			imageSocial: require('./images/pointnclick-social.png'),
		},
		{
			id: 'retro',
			label: '#retro',
			image: require('./images/retro.png'),
			imageSocial: require('./images/retro-social.png'),
		},
		{
			id: 'roguelike',
			label: '#roguelike',
			image: require('./images/roguelike.png'),
			imageSocial: require('./images/roguelike-social.png'),
		},
		{
			id: 'scifi',
			label: '#scifi',
			image: require('./images/scifi.png'),
			imageSocial: require('./images/scifi-social.png'),
		},
		{
			id: 'survival',
			label: '#survival',
			image: require('./images/survival.png'),
			imageSocial: require('./images/survival-social.png'),
		},
		{
			id: 'textadventure',
			label: '#textadventure',
			image: require('./images/textadventure.png'),
			imageSocial: require('./images/textadventure-social.png'),
		},
		{
			id: 'action',
			label: '#action',
			image: require('./images/action.png'),
			imageSocial: require('./images/action-social.png'),
		},
		{
			id: 'adventure',
			label: '#adventure',
			image: require('./images/adventure.png'),
			imageSocial: require('./images/adventure-social.png'),
		},
		{
			id: 'arcade',
			label: '#arcade',
			image: require('./images/arcade.png'),
			imageSocial: require('./images/arcade-social.png'),
		},
		{
			id: 'platformer',
			label: '#platformer',
			image: require('./images/platformer.png'),
			imageSocial: require('./images/platformer-social.png'),
		},
		{
			id: 'puzzle',
			label: '#puzzle',
			image: require('./images/puzzle.png'),
			imageSocial: require('./images/puzzle-social.png'),
		},
		{
			id: 'rpg',
			label: '#rpg',
			image: require('./images/rpg.png'),
			imageSocial: require('./images/rpg-social.png'),
		},
		{
			id: 'shooter',
			label: '#shooter',
			image: require('./images/shooter.png'),
			imageSocial: require('./images/shooter-social.png'),
		},
		{
			id: 'sports',
			label: '#sports',
			image: require('./images/sports.png'),
			imageSocial: require('./images/sports-social.png'),
		},
		{
			id: 'strategy',
			label: '#strategy',
			image: require('./images/strategysim.png'),
			imageSocial: require('./images/strategysim-social.png'),
		},
		{
			id: 'other',
			label: '#other',
			image: require('./images/other.png'),
			imageSocial: require('./images/other-social.png'),
		},
	];
}
