import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./new-devlog-post.html?style=./new-devlog-post.styl';

import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { KeyGroup } from '../../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { AppState, AppStore } from '../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppForm } from '../../../../../../lib/gj-lib-client/components/form-vue/form';
import { AppFocusWhen } from '../../../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';
import { AppTooltip } from '../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppFormControlUpload } from '../../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppSketchfabEmbed } from '../../../../../../lib/gj-lib-client/components/sketchfab/embed/embed';
import { GameVideo } from '../../../../../../lib/gj-lib-client/components/game/video/video.model';
import { AppVideoEmbed } from '../../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppFormControlMarkdown } from '../../../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';
import { AppFormLegend } from '../../../../../../lib/gj-lib-client/components/form-vue/legend/legend';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFormControlToggle } from '../../../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { AppPopoverTrigger } from '../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../../lib/gj-lib-client/components/popover/popover';
import { AppFormControlCheckbox } from '../../../../../../lib/gj-lib-client/components/form-vue/control/checkbox/checkbox';
import { AppUserAvatarImg } from '../../../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import * as startOfDay from 'date-fns/start_of_day';
import * as addWeeks from 'date-fns/add_weeks';
import {
	TimezoneData,
	Timezone,
} from '../../../../../../lib/gj-lib-client/components/timezone/timezone.service';
import { determine } from 'jstimezonedetect';
import { AppFormControlDate } from '../../../../../../lib/gj-lib-client/components/form-vue/control/date/date';

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
		AppFormControlCheckbox,
		AppFormControlDate,
		AppFormControlMarkdown,
		AppFormControlToggle,
		AppFormControlUpload,
		AppFormLegend,
		AppSketchfabEmbed,
		AppVideoEmbed,
		AppJolticon,
		AppPopover,
		AppUserAvatarImg,
	},
	directives: {
		AppFocusWhen,
		AppTooltip,
		AppPopoverTrigger,
	},
})
export class FormGameNewDevlogPost extends BaseForm<FormGameDevlogPostModel>
	implements FormOnInit, FormOnLoad, FormOnSubmit, FormOnSubmitSuccess {
	modelClass = FiresidePost as any;

	@AppState
	user!: AppStore['user'];

	@Prop(FiresidePost)
	post!: FiresidePost;

	$refs!: {
		form: AppForm;
	};

	readonly YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_\-]{11})(&.+)*$/i;
	readonly SKETCHFAB_MODEL_REGEX = /^[a-f0-9]{32}$/i;
	readonly MAX_POLL_ITEMS = 10;
	readonly MIN_POLL_DURATION = 5;
	readonly MAX_POLL_DURATION = 20160;

	keyGroups: KeyGroup[] = [];
	wasPublished = false;
	enabledAttachments = false;
	attachmentType = '';
	longEnabled = false;
	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;
	timezones: { [region: string]: (TimezoneData & { label?: string })[] } = null as any;
	now = 0;
	isShowingMorePollOptions = false;
	accessPermissionsEnabled = false;
	isSavedDraftPost = false;

	readonly GameVideo = GameVideo;

	get loadUrl() {
		return `/web/dash/developer/games/devlog/save/${this.model!.game.id}/${this.model!.id}`;
	}

	get shortLabel() {
		return this.$gettext('');
	}

	get mainActionText() {
		if (this.wasPublished) {
			return this.$gettext('Save');
		} else if (this.isScheduling) {
			return this.$gettext('Schedule');
		} else if (this.isSavedDraftPost) {
			return this.$gettext('Publish');
		} else {
			return this.$gettext('Post');
		}
	}

	get draftButtonText() {
		if (this.isSavedDraftPost) {
			return this.$gettext('Save Draft');
		} else {
			return this.$gettext('Save as Draft');
		}
	}

	get enabledImages() {
		return this.enabledAttachments && this.attachmentType === FiresidePost.TYPE_MEDIA;
	}

	get enabledVideo() {
		return this.enabledAttachments && this.attachmentType === FiresidePost.TYPE_VIDEO;
	}

	get enabledSketchfab() {
		return this.enabledAttachments && this.attachmentType === FiresidePost.TYPE_SKETCHFAB;
	}

	get hasValidSketchfabModelId() {
		return (
			this.formModel.sketchfab_id &&
			this.formModel.sketchfab_id.match(this.SKETCHFAB_MODEL_REGEX)
		);
	}

	get hasValidYouTubeUrl() {
		return this.formModel.video_url && this.formModel.video_url.match(this.YOUTUBE_URL_REGEX);
	}

	get youtubeVideoId() {
		const url = this.formModel.video_url;
		if (url) {
			const videoId = new URL(url).searchParams.get('v');
			return videoId;
		}
	}

	get hasOptionalData() {
		return this.longEnabled;
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

	get pollDuration() {
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

	// ///////////////////
	// init functions

	async onInit() {
		await this.fetchTimezones();

		const model = this.model!;

		// save if the post was a saved draft post (not a new draft post)
		if (model.status === FiresidePost.STATUS_DRAFT && model.lead) {
			this.isSavedDraftPost = true;
		}

		this.setField('status', FiresidePost.STATUS_ACTIVE);

		if (model.videos.length) {
			this.setField(
				'video_url',
				'https://www.youtube.com/watch?v=' + model.videos[0].video_id
			);
			this.onEnableVideo();
		} else if (model.sketchfabs.length) {
			this.setField('sketchfab_id', model.sketchfabs[0].sketchfab_id);
			this.onEnableSketchfab();
		} else if (model.hasMedia) {
			this.onEnableImages();
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

		if (model.published_on && model.key_groups.length) {
			this.accessPermissionsEnabled = true;
		}

		if (model.content_markdown) {
			this.longEnabled = true;
		}
	}

	onLoad(payload: any) {
		this.keyGroups = KeyGroup.populate(payload.keyGroups);
		this.wasPublished = payload.wasPublished;
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
	}

	// ///////////////////
	// Attachments

	onEnableImages() {
		this.enabledAttachments = true;
		this.attachmentType = FiresidePost.TYPE_MEDIA;
	}

	onEnableVideo() {
		this.enabledAttachments = true;
		this.attachmentType = FiresidePost.TYPE_VIDEO;
	}

	onEnableSketchfab() {
		this.enabledAttachments = true;
		this.attachmentType = FiresidePost.TYPE_SKETCHFAB;
	}

	onDisableAttachments() {
		this.enabledAttachments = false;
		// clean current values
		switch (this.attachmentType) {
			case FiresidePost.TYPE_SKETCHFAB:
				this.setField('sketchfab_id', '');
				break;
			case FiresidePost.TYPE_VIDEO:
				this.setField('video_url', '');
				break;
		}
		this.attachmentType = '';
	}

	onAddLong() {
		this.longEnabled = true;
	}

	// ///////////////////
	// Poll

	onCreatePoll() {
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

	onRemovePoll() {
		this.setField('poll_item_count', 0);
		this.changed = true;
	}

	onRemovePollItem(idx: number) {
		if (this.formModel.poll_item_count <= 2) {
			return;
		}

		for (let i = idx; i < this.formModel.poll_item_count; i++) {
			this.setField(('poll_item' + i) as any, (this.formModel as any)['poll_item' + (i + 1)]);
		}

		this.setField('poll_item_count', this.formModel.poll_item_count - 1);
		this.changed = true;
	}

	onAddPollItem() {
		if (this.formModel.poll_item_count >= this.MAX_POLL_ITEMS) {
			return;
		}

		this.setField(('poll_item' + (this.formModel.poll_item_count + 1)) as any, '');
		this.setField('poll_item_count', this.formModel.poll_item_count + 1);
		this.changed = true;
	}

	// ///////////////////
	// Access permissions

	onEnableAccessPermissions() {
		this.accessPermissionsEnabled = true;
	}

	onDisableAccessPermissions() {
		this.accessPermissionsEnabled = false;
	}

	// ///////////////////
	// Schedule

	onAddSchedule() {
		if (this.formModel.scheduled_for === null) {
			this.setField('scheduled_for', startOfDay(addWeeks(Date.now(), 1)).getTime());
		}

		this.now = Date.now();
		this.setField('scheduled_for_timezone', determine().name());
		this.changed = true;
	}

	onRemoveSchedule() {
		this.setField('scheduled_for_timezone', null);
		this.setField('scheduled_for', null);
		this.changed = true;
	}

	timezoneByName(timezone: string) {
		for (let region in this.timezones) {
			const tz = this.timezones[region].find(_tz => _tz.i === timezone);
			if (tz) {
				return tz;
			}
		}
		return null;
	}

	async fetchTimezones() {
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

	// ///////////////////
	// Submit

	onDraftSubmit() {
		this.setField('status', FiresidePost.STATUS_DRAFT);
		this.$refs.form.submit();
	}

	async onSubmit() {
		// a scheduled post gets saved as draft and will get set to published when the scheduled date is reached
		if (this.isScheduling) {
			this.setField('status', FiresidePost.STATUS_DRAFT);
		}
		this.setField('poll_duration', this.pollDuration * 60); // site-api expects duration in seconds.
		return this.formModel.$save();
	}

	onSubmitSuccess() {
		Object.assign(this.model as FiresidePost, this.formModel);
	}
}
