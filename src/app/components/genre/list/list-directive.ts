import { Component, Inject } from 'ng-metadata/core';
import template from './list.html';

@Component({
	selector: 'gj-genre-list',
	template,
})
export class ListComponent
{
	categories = [
		{
			label: 'Action',
			img: '/app/img/categories/action.png',
			url: 'action',
		},
		{
			label: 'Adventure',
			img: '/app/img/categories/adventure.png',
			url: 'adventure',
		},
		{
			label: 'Arcade',
			img: '/app/img/categories/arcade.png',
			url: 'arcade',
		},
		{
			label: 'Platformer',
			img: '/app/img/categories/platformer.png',
			url: 'platformer',
		},
		{
			label: 'Puzzle',
			img: '/app/img/categories/puzzle.png',
			url: 'puzzle',
		},
		{
			label: 'RPGs',
			img: '/app/img/categories/rpg.png',
			url: 'rpg',
		},
		{
			label: 'Shooter',
			img: '/app/img/categories/shooter.png',
			url: 'shooter',
		},
		{
			label: 'Sports',
			img: '/app/img/categories/sports.png',
			url: 'sports',
		},
		{
			label: 'Strategy/Sim',
			img: '/app/img/categories/strategy-sim.png',
			url: 'strategy-sim',
		},
		{
			label: 'Other',
			img: '/app/img/categories/other-1.png',
			url: 'other',
		},
	];

	constructor(
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( '$stateParams' ) private $stateParams: ng.ui.IStateParamsService
	)
	{
	}
}
