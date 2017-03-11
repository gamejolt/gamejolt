import { Model } from '../../../../lib/gj-lib-client/components/model/model.service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

export class GameCollection extends Model
{
	static readonly TYPE_FOLLOWED = 'followed';
	static readonly TYPE_DEVELOPER = 'developer';
	static readonly TYPE_OWNED = 'owned';
	static readonly TYPE_RECOMMENDED = 'recommended';
	static readonly TYPE_PLAYLIST = 'playlist';
	static readonly TYPE_BUNDLE = 'bundle';
	static readonly TYPE_TAG = 'tag';

	static readonly USER_TYPES = [
		GameCollection.TYPE_FOLLOWED,
		GameCollection.TYPE_DEVELOPER,
		GameCollection.TYPE_OWNED,
		GameCollection.TYPE_RECOMMENDED,
	];

	_id: string;
	type: string;
	name: string;
	slug: string;
	img_thumbnail: string;
	from_subscription: boolean;
	owner: User;

	constructor( data: any = {} )
	{
		super( data );

		// This is a fake ID that can be used in track by's and what not.
		if ( data.id && data.type ) {
			this._id = data.type + '-' + data.id;
		}

		if ( data.owner ) {
			this.owner = new User( data.owner );
		}
	}

	getTitle()
	{
		let title = this.name;
		if ( this.from_subscription ) {
			title += ' - @' + this.owner.username;
		}
		return title;
	}

	getSref( includeParams?: boolean )
	{
		let sref = 'library.collection.' + this.type;

		if ( includeParams ) {
			sref += '(' + JSON.stringify( this.getSrefParams() ) + ')';
		}

		return sref;
	}

	getSrefParams()
	{
		let id = '' + this.id;
		if ( id[0] === '@' ) {
			id = id.substring( 1 );
		}

		return {
			slug: this.slug,
			id: id,
		};
	}

	$follow()
	{
		return Api.sendRequest( '/web/library/follow/' + this.type, { id: this.id } );
	}

	$unfollow()
	{
		return Api.sendRequest( '/web/library/unfollow/' + this.type, { id: this.id } );
	}
}

Model.create( GameCollection );
