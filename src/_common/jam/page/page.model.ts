import { Model } from '../../model/model.service';
import { JamContentBlock } from '../content-block/content-block.model';
import { Api } from '../../api/api.service';
import { Jam } from '../jam.model';

export class JamPage extends Model {
	jam_id!: number;
	type!: string;
	url!: string;
	title!: string;
	status!: number;
	added_on!: number;
	updated_on!: number;

	block?: JamContentBlock;

	static readonly TYPE_HOME = 'home';
	static readonly TYPE_PARTICIPANTS = 'participants';
	static readonly TYPE_LIVESTREAMS = 'livestreams';
	static readonly TYPE_GAMES = 'games';
	static readonly TYPE_GAME_ENTRY = 'game-entry';
	static readonly TYPE_CUSTOM = 'custom';

	static readonly STATUS_INACTIVE = 0;
	static readonly STATUS_ACTIVE = 1;
	static readonly STATUS_DELETED = 2;

	constructor(data: any = {}) {
		super(data);

		if (data.block) {
			this.block = new JamContentBlock(data.block);
		}
	}

	static $saveSort(jamId: number, pagesSort: number[]) {
		return Api.sendRequest('/jams/manage/jams/content/save-sorted-pages/' + jamId, pagesSort);
	}

	getUrl(jam: Jam) {
		if (jam) {
			return jam.url + (this.url ? '/' + this.url : '');
		}

		return '';
	}

	getFullUrl(jam: Jam) {
		if (jam) {
			return jam.fullUrl + (this.url ? '/' + this.url : '');
		}

		return '';
	}

	getEditUrl(jam: Jam) {
		if (jam && this.block) {
			return this.getFullUrl(jam) + '#edit-content:' + this.block.id;
		}

		return '';
	}

	isActive() {
		return this.status === JamPage.STATUS_ACTIVE;
	}

	isShownDuring(period: number) {
		if (this.type === JamPage.TYPE_HOME) {
			return true;
		}

		if (this.type === JamPage.TYPE_GAMES) {
			if (period !== Jam.PERIOD_PREJAM) {
				return true;
			}
			return false;
		}

		if (this.type === JamPage.TYPE_LIVESTREAMS) {
			if (period === Jam.PERIOD_RUNNING) {
				return true;
			}
			return false;
		}

		return true;
	}

	isShownDuringState(state: number) {
		if (this.type === JamPage.TYPE_HOME) {
			return true;
		}

		if (this.type === JamPage.TYPE_GAMES) {
			if (state < Jam.TIMELINE_RUNNING) {
				return true;
			}
			return false;
		}

		if (this.type === JamPage.TYPE_LIVESTREAMS) {
			if (state === Jam.TIMELINE_RUNNING) {
				return true;
			}
			return false;
		}

		return true;
	}

	$save() {
		// Are we adding or saving?
		if (!this.id) {
			return this.$_save('/jams/manage/jams/content/add-page/' + this.jam_id, 'jamPage');
		} else {
			return this.$_save('/jams/manage/jams/content/save-page/' + this.id, 'jamPage');
		}
	}

	$setStatus(status: number) {
		return this.$_save(
			'/jams/manage/jams/content/set-page-status/' + this.id + '/' + status,
			'jamPage'
		);
	}

	$remove() {
		return this.$_remove('/jams/manage/jams/content/remove-page/' + this.id);
	}
}

Model.create(JamPage);
