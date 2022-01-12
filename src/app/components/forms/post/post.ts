import { addWeeks, startOfDay } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { arrayRemove } from '../../../../utils/array';
import { trackPostPublish } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import AppCommunityPill from '../../../../_common/community/pill/pill.vue';
import AppExpand from '../../../../_common/expand/expand.vue';
import { FiresidePostCommunity } from '../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { FiresidePostVideo } from '../../../../_common/fireside/post/video/video-model';
import AppFormLegend from '../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlContent from '../../../../_common/form-vue/controls/AppFormControlContent.vue';
import AppFormControlDate from '../../../../_common/form-vue/controls/AppFormControlDate.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlUpload from '../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { AppFocusWhen } from '../../../../_common/form-vue/focus-when.directive';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../../_common/form-vue/form.service';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../_common/form-vue/validators';
import { GameVideo } from '../../../../_common/game/video/video.model';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { KeyGroup } from '../../../../_common/key-group/key-group.model';
import { LinkedAccount } from '../../../../_common/linked-account/linked-account.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppScrollWhen } from '../../../../_common/scroll/scroll-when.directive';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { Timezone, TimezoneData } from '../../../../_common/timezone/timezone.service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppVideoEmbed from '../../../../_common/video/embed/embed.vue';
import AppFormsCommunityPillAdd from '../community/_pill/add/add.vue';
import AppFormsCommunityPill from '../community/_pill/community-pill.vue';
import AppFormsCommunityPillIncomplete from '../community/_pill/incomplete/incomplete.vue';
import AppFormPostMedia from './_media/media.vue';
import { VideoStatus } from './_video/video';
import AppFormPostVideo from './_video/video.vue';

type FormPostModel = FiresidePost & {
	mediaItemIds: number[];
	publishToPlatforms: number[] | null;
	key_group_ids: number[];
	video_id: number;
	attached_communities: { community_id: number; channel_id: number }[];

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

class Wrapper extends BaseForm<FormPostModel> {}

@Options({
	components: {
		AppFormControlDate,
		AppFormControlToggle,
		AppFormControlUpload,
		AppFormLegend,
		AppVideoEmbed,
		AppLoading,
		AppUserAvatarImg,
		AppProgressBar,
		AppFormPostMedia,
		AppFormsCommunityPill,
		AppFormsCommunityPillAdd,
		AppFormsCommunityPillIncomplete,
		AppCommunityPill,
		AppFormControlContent,
		AppScrollScroller,
		AppFormPostVideo,
		AppExpand,
	},
	directives: {
		AppFocusWhen,
		AppScrollWhen,
		AppTooltip,
	},
})
export default class FormPost
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnSubmit, FormOnSubmitSuccess, FormOnSubmitError
{
	@Prop({ type: Object, default: null })
	defaultCommunity!: Community | null;

	@Prop({ type: Object, default: null })
	defaultChannel!: CommunityChannel | null;

	modelClass = FiresidePost as any;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

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
	linkedAccounts: LinkedAccount[] = [];
	publishToPlatforms: number[] | null = null;
	isShowingMorePollOptions = false;
	accessPermissionsEnabled = false;
	isNewPost = false;
	isSavedDraftPost = false;
	leadLengthLimit = 255;
	articleLengthLimit = 50_000;
	isUploadingPastedImage = false;
	maxCommunities = 0;
	attachedCommunities: { community: Community; channel: CommunityChannel }[] = [];
	targetableCommunities: Community[] = [];
	scrollingKey = 1;
	uploadingVideoStatus = VideoStatus.IDLE;
	videoProvider = FiresidePostVideo.PROVIDER_GAMEJOLT;

	readonly GameVideo = GameVideo;
	readonly Screen = Screen;
	readonly FiresidePostVideo = FiresidePostVideo;
	readonly validateContentRequired = validateContentRequired;
	readonly validateContentMaxLength = validateContentMaxLength;
	readonly validateContentNoActiveUploads = validateContentNoActiveUploads;

	@Emit('video-upload-status-change')
	emitVideoUploadStatusChange(_status: VideoStatus) {}

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

	get isPublishingToPlatforms() {
		return !this.wasPublished && this.publishToPlatforms !== null;
	}

	get canEditOwnerLinkedAccounts() {
		// only the owner can edit
		if (this.user) {
			return this.formModel.user.id === this.user.id;
		}
	}

	get hasPublishedToPlatforms() {
		return this.wasPublished && this.publishToPlatforms !== null;
	}

	get leadLengthPercent() {
		return 100 - (this.formModel.leadLength / this.leadLengthLimit) * 100;
	}

	get platformRestrictions() {
		// Platform restriction errors returned from server are prefixed with
		// 'platform-restriction-'.
		return Object.keys(this.serverErrors)
			.filter(i => i.indexOf('platform-restriction-') === 0)
			.map(i => {
				const key = i.substr('platform-restriction-'.length);
				return this.getPlatformRestrictionTitle(key);
			});
	}

	get canAddCommunity() {
		return (
			this.attachedCommunities.length < this.maxCommunities &&
			this.possibleCommunities.length > 0
		);
	}

	get hasChannelError() {
		return this.hasCustomError('channel');
	}

	get possibleCommunities() {
		// Difference between targetable and attached communities.
		return this.targetableCommunities.filter(c1 => {
			// Also exclude the default community. If it is specified,
			// it'll be force-added through the pill-incomplete component.
			if (c1.id === this.defaultCommunity?.id) {
				return false;
			}

			return !this.attachedCommunities.find(c2 => c1.id === c2.community.id);
		});
	}

	get shouldShowCommunities() {
		return (
			this.attachedCommunities.length > 0 ||
			this.possibleCommunities.length > 0 ||
			this.incompleteDefaultCommunity
		);
	}

	get incompleteDefaultCommunity() {
		// The default community is considered incomplete if the channel for it
		// needs to be selected (default channel is null or the community is not attached to the post).

		if (!(this.defaultCommunity instanceof Community)) {
			return null;
		}

		const matchingAttachedCommunity = this.attachedCommunities.find(
			i => i.community.id === this.defaultCommunity!.id
		);

		if (matchingAttachedCommunity) {
			return null;
		}

		return this.defaultCommunity;
	}

	get submitButtonsEnabled() {
		return this.valid && this.uploadingVideoStatus !== VideoStatus.UPLOADING;
	}

	@Watch('formModel.post_to_user_profile')
	onPostToUserProfileToggle() {
		if (this.formModel.post_to_user_profile) {
			this.setField('as_game_owner', false);
		}
	}

	@Watch('formModel.as_game_owner')
	onPostAsGameOwnerToggle() {
		if (this.formModel.as_game_owner) {
			this.setField('post_to_user_profile', false);
		}
	}

	get shouldShowAuthorOptions() {
		if (!this.model?.game || !this.user) {
			return false;
		}

		// Original post authors can always choose whether to share the post on their profile.
		if (this.user.id === this.model.user.id) {
			return true;
		}

		// Otherwise it means we're the resource owner the post was posted on.
		// We can't toggle on sharing the post to profile because its not our post.
		// We can only toggle "as game owner" if the post isn't already shared
		// on the author's profile.
		return !this.model.post_to_user_profile;
	}

	async onInit() {
		const model = this.model!;

		this.isNewPost = model.status === FiresidePost.STATUS_TEMP;
		this.isSavedDraftPost = model.status === FiresidePost.STATUS_DRAFT;

		if (this.isNewPost) {
			this.setField('post_to_user_profile', true);
		}

		this.setField('attached_communities', []);

		if (model.videos.length) {
			this.enableVideo();
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

		if (model.has_article) {
			this.longEnabled = true;
			// Initialize this so ContentEditor doesn't complain while loading in.
			this.setField('article_content', '');
		}

		await this.fetchTimezones();
	}

	onLoad(payload: any) {
		// Pull any post information that may not already be loaded in.
		this.setField('article_content', payload.post.article_content);

		this.keyGroups = KeyGroup.populate(payload.keyGroups);
		this.wasPublished = payload.wasPublished;
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
		this.leadLengthLimit = payload.leadLengthLimit;
		this.articleLengthLimit = payload.articleLengthLimit;
		this.maxCommunities = payload.maxCommunities;

		if (payload.attachedCommunities) {
			this.attachedCommunities = FiresidePostCommunity.populate(
				payload.attachedCommunities
			).map((fpc: FiresidePostCommunity) => {
				return {
					community: fpc.community,
					channel: fpc.channel!,
				};
			});
		}

		if (
			this.defaultCommunity instanceof Community &&
			this.defaultChannel instanceof CommunityChannel &&
			this.defaultCommunity.postableChannels.some(
				channel => channel.title === this.defaultChannel!.title
			)
		) {
			this.attachCommunity(this.defaultCommunity, this.defaultChannel);
		}

		if (payload.targetableCommunities) {
			this.targetableCommunities = Community.populate(payload.targetableCommunities);

			// Filter out communities the user is blocked from,
			// and communities who don't have channels the current user can post to.
			this.targetableCommunities = this.targetableCommunities.filter(
				community => !community.isBlocked && community.postableChannels.length > 0
			);
		}

		this.linkedAccounts = LinkedAccount.populate(payload.linkedAccounts);
		this.publishToPlatforms = payload.publishToPlatforms || null;

		if (this.publishToPlatforms) {
			for (const accountId of this.publishToPlatforms) {
				this.setField(`linked_account_${accountId}` as any, true);
			}
		}
	}

	@Watch('incompleteDefaultCommunity')
	onIncompleteDefaultCommunityChanged() {
		if (this.incompleteDefaultCommunity) {
			this.setCustomError('channel');
		} else {
			this.clearCustomError('channel');
		}
	}

	attachIncompleteCommunity(community: Community, channel: CommunityChannel) {
		this.attachCommunity(community, channel, false);
	}

	attachCommunity(community: Community, channel: CommunityChannel, append = true) {
		// Do nothing if that community is already attached.
		if (this.attachedCommunities.find(i => i.community.id === community.id)) {
			return;
		}

		if (append) {
			this.attachedCommunities.push({ community, channel });
			this.scrollToAdd();
		} else {
			this.attachedCommunities.unshift({ community, channel });
		}
	}

	async scrollToAdd() {
		// Wait for the DOM to update
		await nextTick();
		// Change our scrolling key so AppScrollWhen will bring the 'Add Community' button inview.
		this.scrollingKey *= -1;
	}

	removeCommunity(community: Community) {
		const idx = this.attachedCommunities.findIndex(i => i.community.id === community.id);
		if (idx === -1) {
			console.warn('Attempted to remove a community that is not attached');
			return;
		}

		this.attachedCommunities.splice(idx, 1);
	}

	onDraftSubmit() {
		this.setField('status', FiresidePost.STATUS_DRAFT);
	}

	onPublishSubmit() {
		this.setField('status', FiresidePost.STATUS_ACTIVE);
		trackPostPublish();
	}

	async onSubmit() {
		// a scheduled post gets saved as draft and will get set to published when the scheduled date is reached
		if (this.isScheduling) {
			this.setField('status', FiresidePost.STATUS_DRAFT);
		}

		this.setField(
			'attached_communities',
			this.attachedCommunities.map(({ community, channel }) => {
				return {
					community_id: community.id,
					channel_id: channel.id,
				};
			})
		);

		// Set or clear attachments as needed
		if (this.attachmentType === FiresidePost.TYPE_MEDIA && this.formModel.media) {
			this.setField(
				'mediaItemIds',
				this.formModel.media.map(item => item.id)
			);
		} else {
			this.setField('mediaItemIds', []);
		}

		if (this.attachmentType === FiresidePost.TYPE_VIDEO) {
			if (this.videoProvider === FiresidePostVideo.PROVIDER_GAMEJOLT) {
				// Unset the video url for linked videos and set the video id for uploaded videos
				// to signal to the backend that the attached video should be kept.
				this.setField('video_id', this.formModel.videos[0].id);
			} else {
				this.setField('video_id', 0);
			}
		} else {
			this.setField('video_id', 0);
		}

		if (!this.accessPermissionsEnabled) {
			this.setField('key_group_ids', []);
		}

		if (!this.longEnabled) {
			this.setField('article_content', '');
		}

		this.setField('publishToPlatforms', this.publishToPlatforms);

		this.setField('poll_duration', this.pollDuration * 60); // site-api expects duration in seconds.
		return this.formModel.$save();
	}

	onSubmitSuccess() {
		Object.assign(this.model, this.formModel);
	}

	onSubmitError($payload: any) {
		if ($payload.errors.video_unavailable) {
			showErrorGrowl({
				title: this.$gettext(`Failed to submit post`),
				message: this.$gettext(
					`The video linked in the post is private or otherwise unavailable. Make sure other people can see the video before you post it.`
				),
			});
		}
	}

	enableImages() {
		this.enabledAttachments = true;
		this.attachmentType = FiresidePost.TYPE_MEDIA;
	}

	onMediaUploaded(mediaItems: MediaItem[]) {
		const newMedia = mediaItems.concat(this.formModel.media);
		this.setField('media', newMedia);
	}

	onMediaUploadFailed(reason: string) {
		let message = this.$gettext(
			'Something went wrong while we tried uploading your media. Maybe try again?'
		);
		switch (reason) {
			case 'no-dimensions':
				message = this.$gettext('We failed to analyze your media.');
				break;
			case 'no-image-video':
				message = this.$gettext(
					'Looks like the file you uploaded is not an image or video we recognize.'
				);
				break;
			case 'no-extension':
				message = this.$gettext('We could not determine the file type of your media.');
				break;
			case 'invalid-mime-type':
				message = this.$gettext(
					'We currently do not support the format of your uploaded media. Try exporting it to a different format.'
				);
				break;
		}

		showErrorGrowl(message, this.$gettext('Failed to upload your media.'));
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

	disableAttachments() {
		this.enabledAttachments = false;
		this.attachmentType = '';

		this.setField('media', []);
		this.setField('videos', []);
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

		this.form.changed = true;
	}

	removePoll() {
		this.setField('poll_item_count', 0);
		this.form.changed = true;
	}

	removePollItem(idx: number) {
		if (this.formModel.poll_item_count <= 2) {
			return;
		}

		for (let i = idx; i < this.formModel.poll_item_count; i++) {
			this.setField(('poll_item' + i) as any, (this.formModel as any)['poll_item' + (i + 1)]);
		}

		this.setField('poll_item_count', this.formModel.poll_item_count - 1);
		this.form.changed = true;
	}

	addPollItem() {
		if (this.formModel.poll_item_count >= this.MAX_POLL_ITEMS) {
			return;
		}

		this.setField(('poll_item' + (this.formModel.poll_item_count + 1)) as any, '');
		this.setField('poll_item_count', this.formModel.poll_item_count + 1);
		this.form.changed = true;
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
		this.form.changed = true;
	}

	removeSchedule() {
		this.setField('scheduled_for_timezone', null);
		this.setField('scheduled_for', null);
		this.form.changed = true;
	}

	togglePublishingToPlatforms() {
		if (!this.isPublishingToPlatforms) {
			this.addPublishingToPlatforms();
		} else {
			this.removePublishingToPlatforms();
		}
	}

	async addPublishingToPlatforms() {
		this.publishToPlatforms = [];
	}

	removePublishingToPlatforms() {
		this.publishToPlatforms = null;
	}

	isLinkedAccountActive(id: number) {
		return this.publishToPlatforms && this.publishToPlatforms.indexOf(id) !== -1;
	}

	async changeLinkedAccount(id: number) {
		if (!this.publishToPlatforms) {
			return;
		}

		const isActive = this.isLinkedAccountActive(id);
		if (isActive) {
			arrayRemove(this.publishToPlatforms, i => i === id);
		} else {
			this.publishToPlatforms.push(id);
		}

		this.form.changed = true;
	}

	getLinkedAccountDisplayName(account: LinkedAccount) {
		switch (account.provider) {
			case LinkedAccount.PROVIDER_FACEBOOK:
				return account.facebookSelectedPage && account.facebookSelectedPage.name;

			case LinkedAccount.PROVIDER_TUMBLR:
				return account.tumblrSelectedBlog && account.tumblrSelectedBlog.title;

			default:
				return account.name;
		}
	}

	getPlatformRestrictionTitle(restriction: string) {
		switch (restriction) {
			case 'twitter-lead-too-long':
				return this.$gettext(`Your post lead is too long for a tweet.`);
			case 'twitter-gif-file-size-too-large':
				return this.$gettext(`Twitter doesn't allow GIFs larger than 15MB in filesize.`);
			case 'twitter-too-many-media-items-1-animation':
				return this.$gettext(`Twitter only allows one GIF per tweet.`);
			case 'twitter-too-many-media-items-4-images':
				return this.$gettext(`Twitter only allows a max of 4 images per tweet.`);
			case 'twitter-image-file-size-too-large':
				return this.$gettext(`Twitter doesn't allow images larger than 5MB in filesize.`);
			case 'facebook-media-item-photo-too-large':
				return this.$gettext(`Facebook doesn't allow images larger than 10MB in filesize.`);
			case 'tumblr-media-item-photo-too-large':
				return this.$gettext(`Tumblr doesn't allow images larger than 10MB in filesize.`);
		}

		// We do not have the restriction listed here, try and make the topic
		// somewhat readable.
		return this.$gettextInterpolate(
			`Your post can't be published to the platforms you've selected. Error: %{ error }`,
			{ error: restriction }
		);
	}

	timezoneByName(timezone: string) {
		for (const region in this.timezones) {
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
		for (const region in this.timezones) {
			for (const tz of this.timezones[region]) {
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

	async onPaste(e: ClipboardEvent) {
		// Do not react to paste events when "Images" is not selected.
		if (!!this.attachmentType && this.attachmentType !== FiresidePost.TYPE_MEDIA) {
			return;
		}
		if (this.isUploadingPastedImage) {
			return;
		}

		// Validate clipboard data
		if (!e.clipboardData) {
			return;
		}

		const items = e.clipboardData.items;
		if (!items) {
			return;
		}

		const files = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (item.type.includes('image')) {
				const blob = item.getAsFile();
				if (blob) {
					files.push(blob);
				}
			}
		}

		if (files.length === 0) {
			return;
		}

		// Show image tray.
		if (!this.enabledImages) {
			this.enableImages();
		}

		// Upload
		this.isUploadingPastedImage = true;

		const $payload = await Api.sendRequest(
			`/web/posts/manage/add-media/${this.formModel.id}`,
			{},
			{
				file: files,
				progress: e2 => this.setField('_progress', e2),
				noErrorRedirect: true,
			}
		);

		this.isUploadingPastedImage = false;

		if ($payload.success) {
			// Apply returned media items.
			const mediaItems = MediaItem.populate($payload.mediaItems);
			this.onMediaUploaded(mediaItems);
		} else {
			this.onMediaUploadFailed($payload.reason);
		}
	}

	onVideoChanged(video: FiresidePostVideo | null) {
		if (video === null) {
			this.setField('videos', []);
		} else {
			this.setField('videos', [video]);
		}
	}

	onUploadingVideoStatusChanged(status: VideoStatus) {
		this.uploadingVideoStatus = status;
		this.emitVideoUploadStatusChange(this.uploadingVideoStatus);
	}

	onVideoProviderChanged(provider: string) {
		this.videoProvider = provider;
	}

	onDisableVideoAttachment() {
		this.disableAttachments();
	}
}
