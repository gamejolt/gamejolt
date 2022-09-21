const images = import.meta.glob('./images/*.png', { eager: true });

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
			image: images['./images/fnaf.png'].default,
			imageSocial: images['./images/fnaf-social.png'].default,
		},
		{
			id: 'horror',
			label: '#horror',
			image: images['./images/horror.png'].default,
			imageSocial: images['./images/horror-social.png'].default,
		},
		{
			id: 'fangame',
			label: '#fangame',
			image: images['./images/fangame.png'].default,
			imageSocial: images['./images/fangame-social.png'].default,
		},
		{
			id: 'analog',
			label: '#analog',
			image: images['./images/analog.png'].default,
			imageSocial: images['./images/analog-social.png'].default,
		},
		{
			id: 'multiplayer',
			label: '#multiplayer',
			image: images['./images/multiplayer.png'].default,
			imageSocial: images['./images/multiplayer-social.png'].default,
		},
		{
			id: 'vr',
			label: '#vr',
			image: images['./images/vr.png'].default,
			imageSocial: images['./images/vr-social.png'].default,
		},
		{
			id: 'altgame',
			label: '#altgame',
			image: images['./images/altgame.png'].default,
			imageSocial: images['./images/altgame-social.png'].default,
		},
		{
			id: 'pointnclick',
			label: '#pointnclick',
			image: images['./images/pointnclick.png'].default,
			imageSocial: images['./images/pointnclick-social.png'].default,
		},
		{
			id: 'retro',
			label: '#retro',
			image: images['./images/retro.png'].default,
			imageSocial: images['./images/retro-social.png'].default,
		},
		{
			id: 'roguelike',
			label: '#roguelike',
			image: images['./images/roguelike.png'].default,
			imageSocial: images['./images/roguelike-social.png'].default,
		},
		{
			id: 'scifi',
			label: '#scifi',
			image: images['./images/scifi.png'].default,
			imageSocial: images['./images/scifi-social.png'].default,
		},
		{
			id: 'survival',
			label: '#survival',
			image: images['./images/survival.png'].default,
			imageSocial: images['./images/survival-social.png'].default,
		},
		{
			id: 'textadventure',
			label: '#textadventure',
			image: images['./images/textadventure.png'].default,
			imageSocial: images['./images/textadventure-social.png'].default,
		},
		{
			id: 'action',
			label: '#action',
			image: images['./images/action.png'].default,
			imageSocial: images['./images/action-social.png'].default,
		},
		{
			id: 'adventure',
			label: '#adventure',
			image: images['./images/adventure.png'].default,
			imageSocial: images['./images/adventure-social.png'].default,
		},
		{
			id: 'arcade',
			label: '#arcade',
			image: images['./images/arcade.png'].default,
			imageSocial: images['./images/arcade-social.png'].default,
		},
		{
			id: 'platformer',
			label: '#platformer',
			image: images['./images/platformer.png'].default,
			imageSocial: images['./images/platformer-social.png'].default,
		},
		{
			id: 'puzzle',
			label: '#puzzle',
			image: images['./images/puzzle.png'].default,
			imageSocial: images['./images/puzzle-social.png'].default,
		},
		{
			id: 'rpg',
			label: '#rpg',
			image: images['./images/rpg.png'].default,
			imageSocial: images['./images/rpg-social.png'].default,
		},
		{
			id: 'shooter',
			label: '#shooter',
			image: images['./images/shooter.png'].default,
			imageSocial: images['./images/shooter-social.png'].default,
		},
		{
			id: 'sports',
			label: '#sports',
			image: images['./images/sports.png'].default,
			imageSocial: images['./images/sports-social.png'].default,
		},
		{
			id: 'strategy',
			label: '#strategy',
			image: images['./images/strategysim.png'].default,
			imageSocial: images['./images/strategysim-social.png'].default,
		},
		{
			id: 'other',
			label: '#other',
			image: images['./images/other.png'].default,
			imageSocial: images['./images/other-social.png'].default,
		},
		{
			id: 'fnf',
			label: '#fnf',
			image: images['./images/fnf.png'].default,
			imageSocial: images['./images/fnf-social.png'].default,
		},
		{
			id: 'undertale',
			label: '#undertale',
			image: images['./images/undertale.png'].default,
			imageSocial: images['./images/undertale-social.png'].default,
		},
	];
}
