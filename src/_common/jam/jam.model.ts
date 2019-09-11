import { Model } from '../model/model.service';
import { Environment } from '../environment/environment.service';
import { Api } from '../api/api.service';
import { JamOrganizer } from './organizer/organizer.model';

const moment = require('moment');

export class Jam extends Model {
	url!: string;
	domain!: string;
	timezone!: string;
	start_date!: number;
	end_date!: number;
	voting_end_date!: number;
	name!: string;
	description!: string;
	jam_hashtag!: string;
	twitter_hashtag!: string;
	activity_feed_enabled!: boolean;
	livestreams_enabled!: boolean;
	blog_enabled!: boolean;
	voting_enabled!: boolean;
	forum_enabled!: boolean;
	chat_enabled!: boolean;
	theme!: any;
	ga_tracking_id!: string;
	has_community_voting!: boolean;
	voting_user_restriction!: string;
	voting_type!: string;
	voting_user_weighting!: boolean;
	has_awards!: boolean;
	status!: string;
	are_results_calculated!: boolean;
	added_on!: number;
	updated_on!: number;
	published_on!: number;
	is_approved!: boolean;

	organizers: JamOrganizer[] = [];
	follower_count!: number;
	is_following?: boolean;

	static readonly STATUS_HIDDEN = 'hidden';
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_UNLISTED = 'unlisted';
	static readonly STATUS_REMOVED = 'removed';

	static readonly PERIOD_PREJAM = 1;
	static readonly PERIOD_RUNNING = 2;
	static readonly PERIOD_VOTING = 3;
	static readonly PERIOD_POSTJAM = 4;

	static readonly TIMELINE_PRE = 10;
	static readonly TIMELINE_RUNNING = 20;
	static readonly TIMELINE_VOTING = 21;
	static readonly TIMELINE_POST = 30;
	static readonly TIMELINE_PROCESSING_VOTES = 32;
	static readonly TIMELINE_VOTED = 33;

	constructor(data: any = {}) {
		super(data);

		if (data.organizers) {
			this.organizers = JamOrganizer.populate(data.organizers);
		}
	}

	get manageUrl() {
		return Environment.jamsBaseUrl + '/manage/jams/' + this.id + '/view';
	}

	get fullUrl() {
		return Environment.jamsIoBaseUrl + '/' + this.url;
	}

	getUrl(page?: string): string {
		if (page === 'games') {
			return this.getUrl() + '/games';
		} else if (page === 'manage-edit') {
			return '/manage/jams/' + this.id + '/edit';
		} else if (page === 'manage-voting') {
			return '/manage/jams/' + this.id + '/voting';
		}

		return '/' + this.url;
	}

	/**
	 * Get what period the jam is currently in at this exact moment.
	 */
	getPeriod() {
		const now = moment();

		// Are we in a pre-jam state?
		const startMoment = moment(this.start_date);
		if (now.isBefore(startMoment)) {
			return Jam.PERIOD_PREJAM;
		}

		// Is the jam currently running?
		const endMoment = moment(this.end_date);
		if (now.isBefore(endMoment)) {
			return Jam.PERIOD_RUNNING;
		}

		// Are we in a voting period?
		if (this.voting_enabled) {
			const votingEndMoment = moment(this.voting_end_date);

			if (now.isBefore(votingEndMoment)) {
				return Jam.PERIOD_VOTING;
			}
		}

		// If all previous checks failed, then our jam is over.
		return Jam.PERIOD_POSTJAM;
	}

	getTimelineState() {
		const period = this.getPeriod();

		if (period === Jam.PERIOD_PREJAM) {
			return Jam.TIMELINE_PRE;
		} else if (period === Jam.PERIOD_RUNNING) {
			return Jam.TIMELINE_RUNNING;
		} else if (period === Jam.PERIOD_VOTING) {
			return Jam.TIMELINE_VOTING;
		} else if (!this.voting_enabled && period === Jam.PERIOD_POSTJAM) {
			return Jam.TIMELINE_POST;
		} else if (this.voting_enabled && period === Jam.PERIOD_POSTJAM) {
			if (!this.are_results_calculated) {
				return Jam.TIMELINE_PROCESSING_VOTES;
			} else {
				return Jam.TIMELINE_VOTED;
			}
		}

		return undefined;
	}

	hasCommunityVoting() {
		return this.voting_enabled && this.has_community_voting;
	}

	hasAwards() {
		return this.voting_enabled && this.has_awards;
	}

	$save() {
		if (!this.id) {
			return this.$_save('/jams/manage/jams/add', 'jam');
		} else {
			return this.$_save('/jams/manage/jams/save/' + this.id, 'jam');
		}
	}

	$saveTwitter() {
		return this.$_save('/jams/manage/jams/activity-feed/save-twitter/' + this.id, 'jam');
	}

	$clearTwitter() {
		return this.$_save('/jams/manage/jams/activity-feed/clear-twitter/' + this.id, 'jam');
	}

	$setFeatureState(feature: string, state: number) {
		return this.$_save(
			'/jams/manage/jams/set-feature-state/' + this.id + '/' + feature + '/' + state,
			'jam'
		);
	}

	$saveVoting() {
		return this.$_save('/jams/manage/jams/voting/save/' + this.id, 'jam');
	}

	$setStatus(status: number) {
		return this.$_save('/jams/manage/jams/set-status/' + this.id + '/' + status, 'jam');
	}

	async $saveTheme() {
		// We need to send in the theme instead of the jam to the save method, so we can't use $_save.
		const response = await Api.sendRequest(
			'/jams/manage/jams/theme/save/' + this.id,
			this.theme || {},
			{ sanitizeComplexData: false }
		);
		return await this.processUpdate(response, 'jam');
	}

	$remove() {
		return this.$_remove('/jams/manage/jams/remove/' + this.id);
	}
}

Model.create(Jam);
