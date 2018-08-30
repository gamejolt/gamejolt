import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./devlog-post.html?style=./devlog-post.styl';
import { determine } from 'jstimezonedetect';

import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
	FormOnSubmit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import { KeyGroup } from '../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { AppFormControlMarkdown } from '../../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { AppFocusWhen } from '../../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';
import { AppFormControlToggle } from '../../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { AppState, AppStore } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppUserAvatarImg } from '../../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppFormLegend } from '../../../../../lib/gj-lib-client/components/form-vue/legend/legend';
import { FormOnSubmitSuccess } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import {
	TimezoneData,
	Timezone,
} from '../../../../../lib/gj-lib-client/components/timezone/timezone.service';
import { AppFormControlDate } from '../../../../../lib/gj-lib-client/components/form-vue/control/date/date';
import * as startOfDay from 'date-fns/start_of_day';
import * as addWeeks from 'date-fns/add_weeks';

type FormGameDevlogPostModel = FiresidePost & {
	keyGroups: KeyGroup[];
	video_url: string;
	sketchfab_id: string;

	poll_item_count: number;
	poll_duration: number;
	poll_is_private: boolean;
	poll_days: number;
	poll_hours: number;
	poll_minutes: number;
	poll_item1: string;
	poll_item2: string;
	poll_item3: string;
	poll_item4: string;
	poll_item5: string;
	poll_item6: string;
	poll_item7: string;
	poll_item8: string;
	poll_item9: string;
	poll_item10: string;
};

@View
@Component({
	components: {
		AppFormControlMarkdown,
		AppFormControlUpload,
		AppFormControlToggle,
		AppFormLegend,
		AppUserAvatarImg,
		AppExpand,
		AppJolticon,
		AppFormControlDate,
	},
	directives: {
		AppFocusWhen,
		AppTooltip,
	},
})
export class FormGameDevlogPost extends BaseForm<FormGameDevlogPostModel>
	implements FormOnInit, FormOnLoad, FormOnSubmit, FormOnSubmitSuccess {
	modelClass = FiresidePost as any;

	@AppState
	user!: AppStore['user'];

	@Prop(FiresidePost)
	post!: FiresidePost;

	$refs!: {
		form: AppForm;
	};

	keyGroups: KeyGroup[] = [];
	hasMediaItems = false;
	wasPublished = false;
	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;
	isShowingMoreOptions = false;
	timezones: { [region: string]: (TimezoneData & { label?: string })[] } = null as any;
	now = 0;

	readonly FiresidePost = FiresidePost;
	readonly GameVideo = GameVideo;

	readonly MAX_POLL_ITEMS = 10;
	readonly MIN_DURATION = 5;
	readonly MAX_DURATION = 20160;

	get loadUrl() {
		return `/web/dash/developer/games/devlog/save/${this.model!.game.id}/${this.model!.id}`;
	}

	get isPublished() {
		return this.model && this.model.status === FiresidePost.STATUS_ACTIVE;
	}

	get hasPoll() {
		return this.formModel.poll_item_count > 0;
	}

	get isPollEditable() {
		const poll = this.model!.poll;
		if (poll) {
			return poll.end_time === 0;
		}
		return true;
	}

	get duration() {
		return (
			this.formModel.poll_days * 1440 +
			this.formModel.poll_hours * 60 +
			this.formModel.poll_minutes * 1 // cast to int lol
		);
	}

	get scheduledTimezoneOffset() {
		if (!this.formModel.scheduled_for_timezone) {
			return 0;
		}

		const tz = this.timezoneByName(this.formModel.scheduled_for_timezone);
		if (!tz) {
			console.warn('Could not find timezone offset for: ' + tz);
			return 0;
		} else {
			return tz.o * 1000;
		}
	}

	get isScheduling() {
		return this.formModel.isScheduled;
	}

	async onInit() {
		await this.fetchTimezones();

		const model = this.model!;

		this.setField('status', FiresidePost.STATUS_ACTIVE);

		if (model.type === FiresidePost.TYPE_VIDEO) {
			if (model.videos.length) {
				this.setField(
					'video_url',
					'https://www.youtube.com/watch?v=' + model.videos[0].video_id
				);
			}
		} else if (model.type === FiresidePost.TYPE_SKETCHFAB) {
			if (model.sketchfabs.length) {
				this.setField('sketchfab_id', model.sketchfabs[0].sketchfab_id);
			}
		}

		if (model.poll) {
			const poll = model.poll;

			let duration = poll.duration / 60; // We want to work in minutes.
			this.setField('poll_duration', duration);

			this.setField('poll_days', Math.floor(duration / 1440));
			duration -= this.formModel.poll_days * 1440;
			this.setField('poll_hours', Math.floor(duration / 60));
			duration -= this.formModel.poll_hours * 60;
			this.setField('poll_minutes', duration);

			this.setField('poll_is_private', poll.is_private);

			this.setField('poll_item_count', poll.items.length);
			for (let i = 0; i < poll.items.length; i++) {
				this.setField(('poll_item' + (i + 1)) as any, poll.items[i].text);
			}
		}
	}

	onLoad(payload: any) {
		this.keyGroups = KeyGroup.populate(payload.keyGroups);
		this.hasMediaItems = payload.hasMediaItems;
		this.wasPublished = payload.wasPublished;
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
	}

	private async fetchTimezones() {
		// Get timezones list.
		this.timezones = await Timezone.getGroupedTimezones();
		for (let region in this.timezones) {
			for (let tz of this.timezones[region]) {
				let offset = '';
				if (tz.o > 0) {
					offset = `+${tz.o / 3600}:00`;
				} else if (tz.o < 0) {
					offset = `-${-tz.o / 3600}:00`;
				}
				tz.label = `(UTC${offset}) ${tz.i}`;
			}
		}
	}

	private timezoneByName(timezone: string) {
		for (let region in this.timezones) {
			const tz = this.timezones[region].find(_tz => _tz.i === timezone);
			if (tz) {
				return tz;
			}
		}
		return null;
	}

	createPoll() {
		// Initialize default poll
		this.setField('poll_days', 1);
		this.setField('poll_hours', 0);
		this.setField('poll_minutes', 0);
		this.setField('poll_item_count', 2);
		for (let i = 0; i < this.MAX_POLL_ITEMS; i++) {
			this.setField(('poll_item' + (i + 1)) as any, '');
		}

		this.changed = true;
	}

	async removePoll() {
		this.setField('poll_item_count', 0);
		this.changed = true;
	}

	removePollItem(idx: number) {
		if (this.formModel.poll_item_count <= 2) {
			return;
		}

		for (let i = idx; i < this.formModel.poll_item_count; i++) {
			this.setField(('poll_item' + i) as any, (this.formModel as any)['poll_item' + (i + 1)]);
		}

		this.setField('poll_item_count', this.formModel.poll_item_count - 1);
		this.changed = true;
	}

	addPollItem() {
		if (this.formModel.poll_item_count >= this.MAX_POLL_ITEMS) {
			return;
		}

		this.setField(('poll_item' + (this.formModel.poll_item_count + 1)) as any, '');
		this.setField('poll_item_count', this.formModel.poll_item_count + 1);
		this.changed = true;
	}

	async addSchedule() {
		if (this.formModel.scheduled_for === null) {
			this.setField('scheduled_for', startOfDay(addWeeks(Date.now(), 1)).getTime());
		}

		this.now = Date.now();
		this.setField('scheduled_for_timezone', determine().name());
		this.changed = true;
	}

	removeSchedule() {
		this.setField('scheduled_for_timezone', null);
		this.setField('scheduled_for', null);
		this.changed = true;
	}

	onDraftSubmit() {
		this.setField('status', FiresidePost.STATUS_DRAFT);
		this.$refs.form.submit();
	}

	async onSubmit() {
		// if the post is scheduled, default submit action is draft
		if (this.isScheduling) {
			this.setField('status', FiresidePost.STATUS_DRAFT);
		}
		this.setField('poll_duration', this.duration * 60); // site-api expects duration in seconds.
		return this.formModel.$save();
	}

	onSubmitSuccess() {
		Object.assign(this.model as FiresidePost, this.formModel);
	}
}
