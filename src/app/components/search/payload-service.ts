import { Injectable } from 'ng-metadata/core';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';

export function SearchPayloadFactory(
	$injector: any,
	Environment: any,
	User: any,
	Game: any,
)
{
	SearchPayload.$injector = $injector;
	SearchPayload.Environment = Environment;
	SearchPayload.User = User;
	SearchPayload.Game = Game;
	return SearchPayload;
}

@Injectable()
export class SearchPayload
{
	static $injector: any;
	static Environment: Environment;
	static User: any;
	static Game: any;

	users: any[];
	games: any[];
	devlogs: any[];
	libraryGames: any[];

	constructor( public type: string, data: any )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		this.users = SearchPayload.User.populate( data.users );
		this.games = SearchPayload.Game.populate( data.games );
		this.devlogs = SearchPayload.Game.populate( data.devlogs );
		this.libraryGames = SearchPayload.Environment.isClient && data.libraryGames
		? SearchPayload.$injector.get( 'LocalDb_Game' ).populate( data.libraryGames )
		: [];
	}
}
