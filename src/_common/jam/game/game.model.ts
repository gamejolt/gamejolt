// import { Model } from '../../model/model.service';
// import { User } from '../../user/user.model';
// import { JamAward } from '../award/award.model';
// import { Environment } from '../../environment/environment.service';
// import { Api } from '../../api/api.service';
// import { Jam } from '../jam.model';

// export class JamGame extends Model {
// 	developer: User;
// 	title: string;
// 	url: string;
// 	slug: string;
// 	img_thumbnail: string;
// 	entered_on: Date;
// 	force_hidden: boolean;
// 	late_entry: boolean;
// 	approved_entry: boolean;
// 	overall_rank: number;

// 	// Will only be available if Jam_Award_Game::populateAwardsForGames() was called on this game.
// 	awards: JamAward[];

// 	constructor(data: any = {}) {
// 		super(data);

// 		if (data.developer) {
// 			this.developer = new User(data.developer);
// 		}

// 		if (data.entered_on) {
// 			this.entered_on = new Date(data.entered_on);
// 		}

// 		if (data.awards) {
// 			this.awards = JamAward.populate(data.awards);
// 		}
// 	}

// 	getUrl(jam: Jam) {
// 		if (jam) {
// 			return '/' + jam.url + '/games/' + this.slug + '/' + this.id;
// 		}

// 		return '';
// 	}

// 	getFullUrl(jam: Jam) {
// 		return Environment.jamsIoBaseUrl + this.getUrl(jam);
// 	}

// 	/**
// 	 * The below methods can't use the model helpers.
// 	 * We don't want to pull in the data from the server and repopulate this model.
// 	 * This is because we may lose special fields like "force_hidden" and "approved_entry".
// 	 */

// 	async $hide(jamId: number) {
// 		await Api.sendRequest(
// 			'/jams/manage/jams/games/set-game-visibility/' + jamId + '/' + this.id + '/0',
// 			{}
// 		);
// 		this.force_hidden = true;
// 	}

// 	async $unhide(jamId: number) {
// 		await Api.sendRequest(
// 			'/jams/manage/jams/games/set-game-visibility/' + jamId + '/' + this.id + '/1',
// 			{}
// 		);
// 		this.force_hidden = false;
// 	}

// 	async $approve(jamId: number) {
// 		await Api.sendRequest('/jams/manage/jams/games/approve-entry/' + jamId + '/' + this.id, {});
// 		this.approved_entry = true;
// 	}

// 	async $reject(jamId: number) {
// 		await Api.sendRequest('/jams/manage/jams/games/reject-entry/' + jamId + '/' + this.id, {});
// 		this.approved_entry = false;
// 	}
// }

// Model.create(JamGame);
