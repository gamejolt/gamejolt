import { Component, Inject } from 'ng-metadata/core';
import template from 'html!./list.html';

@Component({
	selector: 'gj-genre-list',
	template,
})
export class ListComponent
{
	categories = [
		{
			label: 'Action',
			img: '/app/components/channel/action.png',
			url: 'action',
		},
		{
			label: 'Adventure',
			img: '/app/components/channel/adventure.png',
			url: 'adventure',
		},
		{
			label: 'Arcade',
			img: '/app/components/channel/arcade.png',
			url: 'arcade',
		},
		{
			label: 'Platformer',
			img: '/app/components/channel/platformer.png',
			url: 'platformer',
		},
		{
			label: 'Puzzle',
			img: '/app/components/channel/puzzle.png',
			url: 'puzzle',
		},
		{
			label: 'RPGs',
			img: '/app/components/channel/rpg.png',
			url: 'rpg',
		},
		{
			label: 'Shooter',
			img: '/app/components/channel/shooter.png',
			url: 'shooter',
		},
		{
			label: 'Sports',
			img: '/app/components/channel/sports.png',
			url: 'sports',
		},
		{
			label: 'Strategy/Sim',
			img: '/app/components/channel/strategysim.png',
			url: 'strategy-sim',
		},
		{
			label: 'Other',
			img: '/app/components/channel/other.png',
			url: 'other',
		},
	];

	constructor(
		@Inject( '$state' ) public $state: ng.ui.IStateService,
		@Inject( '$stateParams' ) public $stateParams: ng.ui.IStateParamsService
	)
	{
	}
}
