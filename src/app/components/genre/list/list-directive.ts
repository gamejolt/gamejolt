import { Component, Inject } from 'ng-metadata/core';
import { StateService, StateParams } from 'angular-ui-router';
import * as template from '!html-loader!./list.html';

@Component({
	selector: 'gj-genre-list',
	template,
})
export class ListComponent
{
	categories = [
		{
			label: 'Action',
			img: require( '../../channel/action.png' ),
			url: 'action',
		},
		{
			label: 'Adventure',
			img: require( '../../channel/adventure.png' ),
			url: 'adventure',
		},
		{
			label: 'Arcade',
			img: require( '../../channel/arcade.png' ),
			url: 'arcade',
		},
		{
			label: 'Platformer',
			img: require( '../../channel/platformer.png' ),
			url: 'platformer',
		},
		{
			label: 'Puzzle',
			img: require( '../../channel/puzzle.png' ),
			url: 'puzzle',
		},
		{
			label: 'RPGs',
			img: require( '../../channel/rpg.png' ),
			url: 'rpg',
		},
		{
			label: 'Shooter',
			img: require( '../../channel/shooter.png' ),
			url: 'shooter',
		},
		{
			label: 'Sports',
			img: require( '../../channel/sports.png' ),
			url: 'sports',
		},
		{
			label: 'Strategy/Sim',
			img: require( '../../channel/strategysim.png' ),
			url: 'strategy-sim',
		},
		{
			label: 'Other',
			img: require( '../../channel/other.png' ),
			url: 'other',
		},
	];

	constructor(
		@Inject( '$state' ) public $state: StateService,
		@Inject( '$stateParams' ) public $stateParams: StateParams,
	)
	{
	}
}
