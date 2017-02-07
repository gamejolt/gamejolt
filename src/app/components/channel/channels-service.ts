import { Injectable } from 'ng-metadata/core';

@Injectable( 'Channels' )
export class Channels
{
	images = {
		fnaf: require( './fnaf.png' ),
		horror: require( './horror.png' ),
		fangame: require( './fangame.png' ),
		analog: require( './analog.png' ),
		multiplayer: require( './multiplayer.png' ),
		vr: require( './vr.png' ),
		altgame: require( './altgame.png' ),
		pointnclick: require( './pointnclick.png' ),
		retro: require( './retro.png' ),
		roguelike: require( './roguelike.png' ),
		scifi: require( './scifi.png' ),
		survival: require( './survival.png' ),
		textadventure: require( './textadventure.png' ),
		action: require( './action.png' ),
		adventure: require( './adventure.png' ),
		arcade: require( './arcade.png' ),
		platformer: require( './platformer.png' ),
		puzzle: require( './puzzle.png' ),
		rpg: require( './rpg.png' ),
		shooter: require( './shooter.png' ),
		sports: require( './sports.png' ),
		strategysim: require( './strategysim.png' ),
		other: require( './other.png' ),
	};
}
