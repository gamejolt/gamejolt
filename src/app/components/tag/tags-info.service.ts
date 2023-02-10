const images = import.meta.glob('./images/*.png', { eager: true, as: 'url' });

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
			image: images['./images/fnaf.png'],
			imageSocial: images['./images/fnaf-social.png'],
		},
		{
			id: 'horror',
			label: '#horror',
			image: images['./images/horror.png'],
			imageSocial: images['./images/horror-social.png'],
		},
		{
			id: 'fangame',
			label: '#fangame',
			image: images['./images/fangame.png'],
			imageSocial: images['./images/fangame-social.png'],
		},
		{
			id: 'analog',
			label: '#analog',
			image: images['./images/analog.png'],
			imageSocial: images['./images/analog-social.png'],
		},
		{
			id: 'multiplayer',
			label: '#multiplayer',
			image: images['./images/multiplayer.png'],
			imageSocial: images['./images/multiplayer-social.png'],
		},
		{
			id: 'vr',
			label: '#vr',
			image: images['./images/vr.png'],
			imageSocial: images['./images/vr-social.png'],
		},
		{
			id: 'altgame',
			label: '#altgame',
			image: images['./images/altgame.png'],
			imageSocial: images['./images/altgame-social.png'],
		},
		{
			id: 'pointnclick',
			label: '#pointnclick',
			image: images['./images/pointnclick.png'],
			imageSocial: images['./images/pointnclick-social.png'],
		},
		{
			id: 'retro',
			label: '#retro',
			image: images['./images/retro.png'],
			imageSocial: images['./images/retro-social.png'],
		},
		{
			id: 'roguelike',
			label: '#roguelike',
			image: images['./images/roguelike.png'],
			imageSocial: images['./images/roguelike-social.png'],
		},
		{
			id: 'scifi',
			label: '#scifi',
			image: images['./images/scifi.png'],
			imageSocial: images['./images/scifi-social.png'],
		},
		{
			id: 'survival',
			label: '#survival',
			image: images['./images/survival.png'],
			imageSocial: images['./images/survival-social.png'],
		},
		{
			id: 'textadventure',
			label: '#textadventure',
			image: images['./images/textadventure.png'],
			imageSocial: images['./images/textadventure-social.png'],
		},
		{
			id: 'action',
			label: '#action',
			image: images['./images/action.png'],
			imageSocial: images['./images/action-social.png'],
		},
		{
			id: 'adventure',
			label: '#adventure',
			image: images['./images/adventure.png'],
			imageSocial: images['./images/adventure-social.png'],
		},
		{
			id: 'arcade',
			label: '#arcade',
			image: images['./images/arcade.png'],
			imageSocial: images['./images/arcade-social.png'],
		},
		{
			id: 'platformer',
			label: '#platformer',
			image: images['./images/platformer.png'],
			imageSocial: images['./images/platformer-social.png'],
		},
		{
			id: 'puzzle',
			label: '#puzzle',
			image: images['./images/puzzle.png'],
			imageSocial: images['./images/puzzle-social.png'],
		},
		{
			id: 'rpg',
			label: '#rpg',
			image: images['./images/rpg.png'],
			imageSocial: images['./images/rpg-social.png'],
		},
		{
			id: 'shooter',
			label: '#shooter',
			image: images['./images/shooter.png'],
			imageSocial: images['./images/shooter-social.png'],
		},
		{
			id: 'sports',
			label: '#sports',
			image: images['./images/sports.png'],
			imageSocial: images['./images/sports-social.png'],
		},
		{
			id: 'strategy',
			label: '#strategy',
			image: images['./images/strategysim.png'],
			imageSocial: images['./images/strategysim-social.png'],
		},
		{
			id: 'other',
			label: '#other',
			image: images['./images/other.png'],
			imageSocial: images['./images/other-social.png'],
		},
		{
			id: 'fnf',
			label: '#fnf',
			image: images['./images/fnf.png'],
			imageSocial: images['./images/fnf-social.png'],
		},
		{
			id: 'undertale',
			label: '#undertale',
			image: images['./images/undertale.png'],
			imageSocial: images['./images/undertale-social.png'],
		},
	];
}
