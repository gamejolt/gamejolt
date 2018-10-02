import View from '!view!./post.html?style=./post.styl';
import * as addWeeks from 'date-fns/add_weeks';
import * as startOfDay from 'date-fns/start_of_day';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppFormAutosize } from 'game-jolt-frontend-lib/components/form-vue/autosize.directive';
import { AppFormControlCheckbox } from 'game-jolt-frontend-lib/components/form-vue/control/checkbox/checkbox';
import { AppFormControlDate } from 'game-jolt-frontend-lib/components/form-vue/control/date/date';
import { AppFormControlMarkdown } from 'game-jolt-frontend-lib/components/form-vue/control/markdown/markdown';
import { AppFormControlToggle } from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle';
import { AppFormControlUpload } from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload';
import { AppFocusWhen } from 'game-jolt-frontend-lib/components/form-vue/focus-when.directive';
import { AppForm } from 'game-jolt-frontend-lib/components/form-vue/form';
import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { AppFormLegend } from 'game-jolt-frontend-lib/components/form-vue/legend/legend';
import { GameVideo } from 'game-jolt-frontend-lib/components/game/video/video.model';
import { KeyGroup } from 'game-jolt-frontend-lib/components/key-group/key-group.model';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { AppProgressBar } from 'game-jolt-frontend-lib/components/progress/bar/bar';
import { AppSketchfabEmbed } from 'game-jolt-frontend-lib/components/sketchfab/embed/embed';
import {
	Timezone,
	TimezoneData,
} from 'game-jolt-frontend-lib/components/timezone/timezone.service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { AppUserAvatarImg } from 'game-jolt-frontend-lib/components/user/user-avatar/img/img';
import { AppVideoEmbed } from 'game-jolt-frontend-lib/components/video/embed/embed';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { determine } from 'jstimezonedetect';
import { Component, Prop } from 'vue-property-decorator';
import { AppFormPostMedia } from './_media/media';

type FormPostModel = FiresidePost & {
	mediaItemIds: number[];
	key_group_ids: KeyGroup[];
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
		AppUserAvatarImg,
		AppProgressBar,
		AppFormPostMedia,
	},
	directives: {
		AppFocusWhen,
		AppTooltip,
		AppFormAutosize,
	},
})
export class FormPost extends BaseForm<FormPostModel>
	implements FormOnInit, FormOnLoad, FormOnSubmit, FormOnSubmitSuccess {
	modelClass = FiresidePost as any;

	@AppState
	user!: AppStore['user'];

	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop({ type: String, default: '' })
	defaultAttachmentType!: string;

	$refs!: {
		form: AppForm;
	};

	static readonly LEAD_URL_REGEX = /(https?:\/\/([\/\.\?\-\+a-z0-9=#%_&;,~@])+)/gi;
	readonly YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_\-]{11})(&.+)*$/i;
	readonly SKETCHFAB_URL_REGEX = /^(https:\/\/)?(www.)?sketchfab.com\/models\/[0-9a-f]{32}\/?$/i;
	readonly SKETCHFAB_FIELD_REGEX = /^((https:\/\/)?(www.)?(sketchfab.com\/models\/[0-9a-f]{32}\/?))|([0-9a-f]{32})$/i;
	readonly MAX_POLL_ITEMS = 10;
	readonly MIN_POLL_DURATION = 5;
	readonly MAX_POLL_DURATION = 20160;

	keyGroups: KeyGroup[] = [];
	wasPublished = false;
	attachmentType = '';
	enabledAttachments = false;
	longEnabled = false;
	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;
	timezones: { [region: string]: (TimezoneData & { label?: string })[] } = null as any;
	now = 0;
	isShowingMorePollOptions = false;
	accessPermissionsEnabled = false;
	isSavedDraftPost = false;
	leadUrlLength = 30;
	leadLengthLimit = 255;
	leadTotalLengthLimit = 300;

	readonly GameVideo = GameVideo;

	get loadUrl() {
		return `/web/posts/manage/save/${this.model!.id}`;
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
			this.formModel.sketchfab_id.match(this.SKETCHFAB_FIELD_REGEX)
		);
	}

	get sketchfabId() {
		if (this.formModel.sketchfab_id.match(this.SKETCHFAB_URL_REGEX)) {
			// extract model id from url
			const matches = this.formModel.sketchfab_id.match(/[a-f0-9]{32}/i);
			if (matches && matches.length > 0) {
				return matches[0];
			}
		}
		return this.formModel.sketchfab_id;
	}

	get hasValidYouTubeUrl() {
		return this.formModel.video_url && this.formModel.video_url.match(this.YOUTUBE_URL_REGEX);
	}

	get youtubeVideoId() {
		const url = this.formModel.video_url;
		if (url) {
			// extract video id from url
			const matches = url.match(/\?v=[a-zA-Z0-9_\-]{11}/);
			if (matches && matches.length > 0) {
				const videoId = matches[0].substr(3);
				return videoId;
			}
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
			return !poll.end_time;
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

	get computedLeadLength() {
		const regex = FormPost.LEAD_URL_REGEX;
		let lead = this.formModel.lead;
		if (!lead) {
			return 0;
		}

		if (lead.match(regex)) {
			lead = lead.replace(regex, ' '.repeat(this.leadUrlLength));
		}

		// js is utf18, we need to calc the byte length
		// thank you https://github.com/substack/utf8-length !
		// tslint:disable-next-line:no-bitwise
		return ~-encodeURI(lead).split(/%..|./).length;
	}

	get leadLengthPercent() {
		return 100 - (this.computedLeadLength / this.leadLengthLimit) * 100;
	}

	get isLeadValid() {
		return this.computedLeadLength <= this.leadLengthLimit;
	}

	async onInit() {
		await this.fetchTimezones();

		const model = this.model!;

		// save if the post was a saved draft post (not a new draft post)
		if (model.status === FiresidePost.STATUS_DRAFT && model.lead) {
			this.isSavedDraftPost = true;
		}

		this.setField('status', FiresidePost.STATUS_ACTIVE);

		// Set up the default attachment if one was passed in.
		if (this.defaultAttachmentType === 'article') {
			this.longEnabled = true;
		} else {
			this.attachmentType = this.defaultAttachmentType;
		}

		if (model.videos.length) {
			this.setField(
				'video_url',
				'https://www.youtube.com/watch?v=' + model.videos[0].video_id
			);
			this.enableVideo();
		} else if (model.sketchfabs.length) {
			this.setField('sketchfab_id', model.sketchfabs[0].sketchfab_id);
			this.enableSketchfab();
		} else if (model.hasMedia) {
			this.enableImages();
		} else if (this.attachmentType !== '') {
			this.enabledAttachments = true;
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

		if (model.key_groups.length) {
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
		this.leadUrlLength = payload.leadUrlLength;
		this.leadLengthLimit = payload.leadLengthLimit;
		this.leadTotalLengthLimit = payload.leadTotalLengthLimit;
	}

	enableImages() {
		this.enabledAttachments = true;
		this.attachmentType = FiresidePost.TYPE_MEDIA;
	}

	onMediaUploaded(mediaItems: MediaItem[]) {
		const newMedia = mediaItems.concat(this.formModel.media);
		this.setField('media', newMedia);
	}

	onMediaSort(mediaItems: MediaItem[]) {
		this.setField('media', mediaItems);
	}

	removeMediaItem(mediaItem: MediaItem) {
		const newMedia = this.formModel.media.filter(item => item.id !== mediaItem.id);
		this.setField('media', newMedia);
	}

	enableVideo() {
		this.enabledAttachments = true;
		this.attachmentType = FiresidePost.TYPE_VIDEO;
	}

	enableSketchfab() {
		this.enabledAttachments = true;
		this.attachmentType = FiresidePost.TYPE_SKETCHFAB;
	}

	disableAttachments() {
		this.enabledAttachments = false;
		this.attachmentType = '';

		this.setField('video_url', '');
		this.setField('sketchfab_id', '');
		this.setField('media', []);
	}

	toggleLong() {
		this.longEnabled = !this.longEnabled;
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

	removePoll() {
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

	enableAccessPermissions() {
		this.accessPermissionsEnabled = true;
	}

	disableAccessPermissions() {
		this.accessPermissionsEnabled = false;
	}

	addSchedule() {
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

	onDraftSubmit() {
		this.setField('status', FiresidePost.STATUS_DRAFT);
		this.$refs.form.submit();
	}

	async onSubmit() {
		// a scheduled post gets saved as draft and will get set to published when the scheduled date is reached
		if (this.isScheduling) {
			this.setField('status', FiresidePost.STATUS_DRAFT);
		}

		// Set or clear attachments as needed
		if (this.attachmentType === FiresidePost.TYPE_MEDIA && this.formModel.media) {
			this.setField('mediaItemIds', this.formModel.media.map(item => item.id));
		} else {
			this.setField('mediaItemIds', []);
		}

		if (this.attachmentType !== FiresidePost.TYPE_VIDEO || !this.formModel.video_url) {
			this.setField('video_url', '');
		}

		if (this.attachmentType === FiresidePost.TYPE_SKETCHFAB && this.formModel.sketchfab_id) {
			this.setField('sketchfab_id', this.sketchfabId);
		} else {
			this.setField('sketchfab_id', '');
		}

		if (!this.accessPermissionsEnabled) {
			this.setField('key_group_ids', []);
		}

		if (!this.longEnabled) {
			this.setField('content_markdown', '');
		}

		this.setField('poll_duration', this.pollDuration * 60); // site-api expects duration in seconds.
		return this.formModel.$save();
	}

	onSubmitSuccess() {
		Object.assign(this.model as FiresidePost, this.formModel);
	}
}
