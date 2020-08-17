import { addWeeks, startOfDay } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { arrayRemove } from '../../../../utils/array';
import { propOptional } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import AppCommunityChannelSelect from '../../../../_common/community/channel/select/select.vue';
import { Community } from '../../../../_common/community/community.model';
import AppCommunityPill from '../../../../_common/community/pill/pill.vue';
import { ContentDocument } from '../../../../_common/content/content-document';
import { ContentWriter } from '../../../../_common/content/content-writer';
import { FiresidePostCommunity } from '../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import {
	AppFormAutosize,
	AutosizeBootstrap,
} from '../../../../_common/form-vue/autosize.directive';
import AppFormControlCheckbox from '../../../../_common/form-vue/control/checkbox/checkbox.vue';
import AppFormControlContent from '../../../../_common/form-vue/control/content/content.vue';
import AppFormControlDate from '../../../../_common/form-vue/control/date/date.vue';
import AppFormControlToggle from '../../../../_common/form-vue/control/toggle/toggle.vue';
import AppFormControlUpload from '../../../../_common/form-vue/control/upload/upload.vue';
import { AppFocusWhen } from '../../../../_common/form-vue/focus-when.directive';
import AppForm from '../../../../_common/form-vue/form';
import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../../_common/form-vue/form.service';
import AppFormLegend from '../../../../_common/form-vue/legend/legend.vue';
import { GameVideo } from '../../../../_common/game/video/video.model';
import { Growls } from '../../../../_common/growls/growls.service';
import { KeyGroup } from '../../../../_common/key-group/key-group.model';
import { LinkedAccount } from '../../../../_common/linked-account/linked-account.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppScrollWhen } from '../../../../_common/scroll/scroll-when.directive';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import {
	getSketchfabIdFromInput,
	SKETCHFAB_FIELD_VALIDATION_REGEX,
} from '../../../../_common/sketchfab/embed/embed';
import AppSketchfabEmbed from '../../../../_common/sketchfab/embed/embed.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { Timezone, TimezoneData } from '../../../../_common/timezone/timezone.service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppVideoEmbed from '../../../../_common/video/embed/embed.vue';
import AppFormPostCommunityPillAdd from './_community-pill/add/add.vue';
import AppFormPostCommunityPill from './_community-pill/community-pill.vue';
import AppFormPostCommunityPillIncomplete from './_community-pill/incomplete/incomplete.vue';
import AppFormPostMedia from './_media/media.vue';

type FormPostModel = FiresidePost & {
	mediaItemIds: number[];
	publishToPlatforms: number[] | null;
	key_group_ids: number[];
	video_url: string;
	sketchfab_id: string;
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

@Component({
	components: {
		AppFormControlCheckbox,
		AppFormControlDate,
		AppFormControlToggle,
		AppFormControlUpload,
		AppFormLegend,
		AppSketchfabEmbed,
		AppVideoEmbed,
		AppLoading,
		AppUserAvatarImg,
		AppProgressBar,
		AppFormPostMedia,
		AppFormPostCommunityPill,
		AppFormPostCommunityPillAdd,
		AppFormPostCommunityPillIncomplete,
		AppCommunityPill,
		AppCommunityChannelSelect,
		AppFormControlContent,
		AppScrollScroller,
	},
	directives: {
		AppFocusWhen,
		AppScrollWhen,
		AppTooltip,
		AppFormAutosize,
	},
})
export default class FormPost extends BaseForm<FormPostModel>
	implements FormOnInit, FormOnLoad, FormOnSubmit, FormOnSubmitSuccess, FormOnSubmitError {
	modelClass = FiresidePost as any;

	@AppState
	user!: AppStore['user'];

	@Prop(propOptional(Community, null))
	defaultCommunity!: Community | null;

	@Prop(propOptional(CommunityChannel, null))
	defaultChannel!: CommunityChannel | null;

	$refs!: {
		form: AppForm;
	};

	readonly YOUTUBE_URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_\-]{11})(?:&.+)*$/i;
	readonly SKETCHFAB_FIELD_REGEX = SKETCHFAB_FIELD_VALIDATION_REGEX;

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
	isSavedDraftPost = false;
	leadLengthLimit = 255;
	articleLengthLimit = 3000;
	isUploadingPastedImage = false;
	maxCommunities = 0;
	attachedCommunities: { community: Community; channel: CommunityChannel }[] = [];
	targetableCommunities: Community[] = [];
	scrollingKey = 1;

	private updateAutosize?: () => void;

	readonly GameVideo = GameVideo;
	readonly Screen = Screen;

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
		return getSketchfabIdFromInput(this.formModel.sketchfab_id);
	}

	get hasValidYouTubeUrl() {
		return this.formModel.video_url && this.formModel.video_url.match(this.YOUTUBE_URL_REGEX);
	}

	get youtubeVideoId() {
		const url = this.formModel.video_url;
		if (url) {
			// extract video id from url
			const matches = url.match(this.YOUTUBE_URL_REGEX);
			if (matches && matches.length > 1) {
				const videoId = matches[1];
				return videoId;
			}
		}
	}

	get hasOptionalData() {
		return this.longEnabled;
	}

	get tagContentDocuments() {
		const documents = [] as ContentDocument[];
		if (this.formModel.hasLead) {
			const leadDoc = ContentDocument.fromJson(this.formModel.lead_content);
			documents.push(leadDoc);
			if (this.formModel.hasArticle) {
				const articleDoc = ContentDocument.fromJson(this.formModel.article_content);
				documents.push(articleDoc);
			}
		}
		return documents;
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
		return this.attachedCommunities.length > 0 || this.possibleCommunities.length > 0;
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

	@Watch('formModel.post_to_user_profile')
	onPostToUserProfileToggle() {
		if (!!this.formModel.post_to_user_profile) {
			this.setField('as_game_owner', false);
		}
	}

	@Watch('formModel.as_game_owner')
	onPostAsGameOwnerToggle() {
		if (!!this.formModel.as_game_owner) {
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

		// save if the post was a saved draft post (not a new draft post)
		if (model.status === FiresidePost.STATUS_DRAFT && model.hasLead) {
			this.isSavedDraftPost = true;
		}

		this.setField('status', FiresidePost.STATUS_ACTIVE);

		this.setField('attached_communities', []);

		this.setField('post_to_user_profile', true);

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

		if (model.hasArticle) {
			this.longEnabled = true;
		}

		await this.fetchTimezones();
	}

	onLoad(payload: any) {
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
		await this.$nextTick();
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
			Growls.error({
				title: this.$gettext(`Failed to submit post`),
				message: this.$gettext(
					`The video linked in the post is private or otherwise unavailable. Make sure other people can see the video before you post it.`
				),
			});
		}
	}

	/**
	 * This is called when the autosize directive is bootstrapped. It passes us
	 * some hooks that we can call to modify it.
	 */
	bootstrapAutosize({ updater }: AutosizeBootstrap) {
		this.updateAutosize = updater;
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

		Growls.error(message, this.$gettext('Failed to upload your media.'));
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

	async addTag(tag: string) {
		const doc = ContentDocument.fromJson(this.formModel.lead_content);
		const writer = new ContentWriter(doc);
		writer.appendTag(tag);
		this.setField('lead_content', doc.toJson());

		if (this.updateAutosize) {
			await this.$nextTick();
			this.updateAutosize();
		}
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

		this.changed = true;
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

	async onPaste(e: ClipboardEvent) {
		// Do not react to paste events when videos/sketchfab is selected.
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
}
