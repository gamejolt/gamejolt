<script lang="ts" setup>
import { addWeeks, startOfDay } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { computed, nextTick, PropType, ref, toRefs, watch } from 'vue';
import { arrayRemove } from '../../../../utils/array';
import { trackPostPublish } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { Background } from '../../../../_common/background/background.model';
import AppButton from '../../../../_common/button/AppButton.vue';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { FiresidePostCommunity } from '../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { FiresidePostVideo } from '../../../../_common/fireside/post/video/video-model';
import AppForm, {
	createForm,
	defineFormProps,
	FormController,
} from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormLegend from '../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlBackground from '../../../../_common/form-vue/controls/AppFormControlBackground.vue';
import AppFormControlCheckbox from '../../../../_common/form-vue/controls/AppFormControlCheckbox.vue';
import AppFormControlContent from '../../../../_common/form-vue/controls/AppFormControlContent.vue';
import AppFormControlDate from '../../../../_common/form-vue/controls/AppFormControlDate.vue';
import AppFormControlSelect from '../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
	validateMaxLength,
	validateMaxValue,
	validateMinValue,
} from '../../../../_common/form-vue/validators';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { KeyGroup } from '../../../../_common/key-group/key-group.model';
import { LinkedAccount } from '../../../../_common/linked-account/linked-account.model';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppProgressBar from '../../../../_common/progress/AppProgressBar.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { vAppScrollWhen } from '../../../../_common/scroll/scroll-when.directive';
import { SettingPostBackgroundId } from '../../../../_common/settings/settings.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { Timezone, TimezoneData } from '../../../../_common/timezone/timezone.service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import {
	$gettext,
	$gettextInterpolate,
	$ngettext,
} from '../../../../_common/translate/translate.service';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppFormsCommunityPillAdd from '../community/_pill/add/add.vue';
import AppFormsCommunityPill from '../community/_pill/community-pill.vue';
import AppFormsCommunityPillIncomplete from '../community/_pill/incomplete/incomplete.vue';
import AppFormPostMedia from './_media/media.vue';
import AppFormPostVideo, { VideoStatus } from './_video/video.vue';

type FormPostModel = FiresidePost & {
	mediaItemIds: number[];
	publishToPlatforms: number[] | null;
	key_group_ids: number[];
	video_id: number;
	attached_communities: { community_id: number; channel_id: number }[];
	background_id: number | null;

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

const MAX_POLL_ITEMS = 10;
const MIN_POLL_DURATION = 5;
const MAX_POLL_DURATION = 20160;

const props = defineProps({
	defaultCommunity: { type: Object as PropType<Community | null>, default: null },
	defaultChannel: { type: Object as PropType<CommunityChannel | null>, default: null },
	overlay: { type: Boolean, default: false },
	...defineFormProps<FiresidePost>(true),
});

const emit = defineEmits({
	submit: (_data: FiresidePost) => true,
	videoUploadStatusChange: (_status: VideoStatus) => true,
	backgroundChange: (_background?: Background) => true,
});

const { defaultCommunity, defaultChannel, overlay, model } = toRefs(props);

const { user } = useCommonStore();

const wasPublished = ref(false);
const attachmentType = ref('');
const enabledAttachments = ref(false);
const longEnabled = ref(false);
const maxFilesize = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);
const now = ref(0);

const keyGroups = ref<KeyGroup[]>([]);
const timezones = ref<{ [region: string]: (TimezoneData & { label?: string })[] } | null>(null);
const linkedAccounts = ref<LinkedAccount[]>([]);
const publishToPlatforms = ref<number[] | null>(null);
const attachedCommunities = ref<{ community: Community; channel: CommunityChannel }[]>([]);
const targetableCommunities = ref<Community[]>([]);
const backgrounds = ref<Background[]>([]);

const isShowingMorePollOptions = ref(false);
const accessPermissionsEnabled = ref(false);
const isNewPost = ref(false);
const isSavedDraftPost = ref(false);
const leadLengthLimit = ref(255);
const articleLengthLimit = ref(50_000);
const isUploadingPastedImage = ref(false);
const maxCommunities = ref(0);
const scrollingKey = ref(1);
const uploadingVideoStatus = ref(VideoStatus.IDLE);
const videoProvider = ref(FiresidePostVideo.PROVIDER_GAMEJOLT);
const hasChangedBackground = ref(false);

const form: FormController<FormPostModel> = createForm({
	model,
	modelClass: FiresidePost,
	loadUrl: computed(() => `/web/posts/manage/save/${model.value.id}`),
	onInit: async () => {
		const _model = model.value;

		isNewPost.value = _model.status === FiresidePost.STATUS_TEMP;
		isSavedDraftPost.value = _model.status === FiresidePost.STATUS_DRAFT;

		if (isNewPost.value) {
			form.formModel.post_to_user_profile = true;
		}

		form.formModel.attached_communities = [];

		if (_model.videos.length) {
			enableVideo();
		} else if (_model.hasMedia) {
			enableImages();
		} else if (attachmentType.value !== '') {
			enabledAttachments.value = true;
		} else if (form.formModel.background) {
			// Assign the background_id directly instead of calling
			// [assignBackgroundId], otherwise it'll always assign `null` as we
			// haven't loaded our eligible backgrounds yet.
			form.formModel.background_id = form.formModel.background.id;
		}

		if (_model.poll) {
			const poll = _model.poll;

			let duration = poll.duration / 60; // We want to work in minutes.
			form.formModel.poll_duration = duration;

			form.formModel.poll_days = Math.floor(duration / 1440);
			duration -= form.formModel.poll_days * 1440;
			form.formModel.poll_hours = Math.floor(duration / 60);
			duration -= form.formModel.poll_hours * 60;
			form.formModel.poll_minutes = duration;

			form.formModel.poll_is_private = poll.is_private;

			form.formModel.poll_item_count = poll.items.length;
			for (let i = 0; i < poll.items.length; i++) {
				(form.formModel[('poll_item' + (i + 1)) as keyof typeof form.formModel] as any) =
					poll.items[i].text;
			}
		}

		if (_model.key_groups.length) {
			accessPermissionsEnabled.value = true;
		}

		if (_model.has_article) {
			longEnabled.value = true;
			// Initialize this so ContentEditor doesn't complain while loading in.
			form.formModel.article_content = '';
		}

		await fetchTimezones();
	},
	onLoad(payload) {
		// Pull any post information that may not already be loaded in.
		form.formModel.article_content = payload.post.article_content;

		keyGroups.value = KeyGroup.populate(payload.keyGroups);
		wasPublished.value = payload.wasPublished;
		maxFilesize.value = payload.maxFilesize;
		maxWidth.value = payload.maxWidth;
		maxHeight.value = payload.maxHeight;
		leadLengthLimit.value = payload.leadLengthLimit;
		articleLengthLimit.value = payload.articleLengthLimit;
		maxCommunities.value = payload.maxCommunities;

		backgrounds.value = Background.populate(payload.backgrounds);

		// Use our saved background id if we're not editing.
		if (!isEditing.value) {
			assignBackgroundId(_getMatchingBackgroundIdFromPref());
		}

		if (payload.attachedCommunities) {
			attachedCommunities.value = FiresidePostCommunity.populate(
				payload.attachedCommunities
			).map((fpc: FiresidePostCommunity) => {
				return {
					community: fpc.community,
					channel: fpc.channel!,
				};
			});
		}

		if (
			defaultCommunity instanceof Community &&
			defaultChannel instanceof CommunityChannel &&
			defaultCommunity.postableChannels.some(
				channel => channel.title === defaultChannel!.title
			)
		) {
			attachCommunity(defaultCommunity, defaultChannel);
		}

		if (payload.targetableCommunities) {
			targetableCommunities.value = Community.populate(payload.targetableCommunities);

			// Filter out communities the user is blocked from,
			// and communities who don't have channels the current user can post to.
			targetableCommunities.value = targetableCommunities.value.filter(
				community => !community.isBlocked && community.postableChannels.length > 0
			);
		}

		linkedAccounts.value = LinkedAccount.populate(payload.linkedAccounts);
		publishToPlatforms.value = payload.publishToPlatforms || null;

		if (publishToPlatforms.value) {
			for (const accountId of publishToPlatforms.value) {
				(form.formModel[
					`linked_account_${accountId}` as keyof typeof form.formModel
				] as any) = true;
			}
		}
	},

	onSubmitError(payload: any) {
		if (payload.errors.video_unavailable) {
			showErrorGrowl({
				title: $gettext(`Failed to submit post`),
				message: $gettext(
					`The video linked in the post is private or otherwise unavailable. Make sure other people can see the video before you post it.`
				),
			});
		}
	},
	onSubmit() {
		// a scheduled post gets saved as draft and will get set to published when the scheduled date is reached
		if (isScheduling.value) {
			form.formModel.status = FiresidePost.STATUS_DRAFT;
		}

		form.formModel.attached_communities = attachedCommunities.value.map(
			({ community, channel }) => ({
				community_id: community.id,
				channel_id: channel.id,
			})
		);

		// Set or clear attachments as needed
		if (attachmentType.value === FiresidePost.TYPE_MEDIA && form.formModel.media) {
			form.formModel.mediaItemIds = form.formModel.media.map(item => item.id);
		} else {
			form.formModel.mediaItemIds = [];
		}

		if (attachmentType.value === FiresidePost.TYPE_VIDEO) {
			if (videoProvider.value === FiresidePostVideo.PROVIDER_GAMEJOLT) {
				// Unset the video url for linked videos and set the video id for uploaded videos
				// to signal to the backend that the attached video should be kept.
				form.formModel.video_id = form.formModel.videos[0].id;
			} else {
				form.formModel.video_id = 0;
			}
		} else {
			form.formModel.video_id = 0;
		}

		if (!accessPermissionsEnabled.value) {
			form.formModel.key_group_ids = [];
		}

		if (!longEnabled.value) {
			form.formModel.article_content = '';
		}

		form.formModel.publishToPlatforms = publishToPlatforms.value;

		form.formModel.poll_duration = pollDuration.value * 60; // site-api expects duration in seconds.

		if (form.formModel.hasAnyMedia) {
			assignBackgroundId(null);
		}

		return form.formModel.$save();
	},
	onSubmitSuccess() {
		Object.assign(model.value, form.formModel);
		emit('submit', model.value);
	},
});

const mainActionText = computed(() => {
	if (wasPublished.value) {
		return $gettext('Save');
	} else if (isScheduling.value) {
		return $gettext('Schedule');
	} else if (isSavedDraftPost.value) {
		return $gettext('Publish');
	} else {
		return $gettext('Post');
	}
});

const backgroundsDisabledText = computed(() => {
	if (!form.formModel.hasAnyMedia) {
		return undefined;
	}

	var vidCount = 0;
	var imgCount = 0;
	const media = [...form.formModel.media, ...form.formModel.videos];
	for (const item of media) {
		if (item instanceof FiresidePostVideo) {
			++vidCount;
			if (vidCount > 1) {
				break;
			}
		} else if (item instanceof MediaItem) {
			++imgCount;
			if (imgCount > 1) {
				break;
			}
		}
	}

	if (vidCount > 0) {
		return $ngettext(
			`Remove your video to add a background`,
			`Remove your videos to add a background`,
			vidCount
		);
	}

	if (imgCount > 0) {
		return $ngettext(
			`Remove your image to add a background`,
			`Remove your images to add a background`,
			vidCount
		);
	}

	return undefined;
});

const isEditing = computed(() => wasPublished.value || isSavedDraftPost.value);

const enabledImages = computed(
	() => enabledAttachments.value && attachmentType.value === FiresidePost.TYPE_MEDIA
);

const enabledVideo = computed(
	() => enabledAttachments.value && attachmentType.value === FiresidePost.TYPE_VIDEO
);

const hasPoll = computed(() => {
	return form.formModel.poll_item_count > 0;
});

const isPollEditable = computed(() => {
	const poll = model.value.poll;
	if (poll) {
		return !poll.end_time;
	}
	return true;
});

const pollDuration = computed(() => {
	return (
		form.formModel.poll_days * 1440 +
		form.formModel.poll_hours * 60 +
		form.formModel.poll_minutes * 1 // cast to int lol
	);
});

const isPollTooShort = computed(() => hasPoll.value && pollDuration.value < MIN_POLL_DURATION);

const isPollTooLong = computed(() => hasPoll.value && pollDuration.value > MAX_POLL_DURATION);

const scheduledTimezoneOffset = computed(() => {
	if (!form.formModel.scheduled_for_timezone) {
		return 0;
	}

	const tz = timezoneByName(form.formModel.scheduled_for_timezone);
	if (!tz) {
		console.warn('Could not find timezone offset for: ' + tz);
		return 0;
	} else {
		return tz.o * 1000;
	}
});

const isScheduling = computed(() => form.formModel.isScheduled);

const isPublishingToPlatforms = computed(
	() => !wasPublished.value && publishToPlatforms.value !== null
);

const hasPublishedToPlatforms = computed(
	() => wasPublished.value && publishToPlatforms.value !== null
);

const leadLengthPercent = computed(
	() => 100 - (form.formModel.leadLength / leadLengthLimit.value) * 100
);

const platformRestrictions = computed(() => {
	// Platform restriction errors returned from server are prefixed with
	// 'platform-restriction-'.
	return Object.keys(form.serverErrors)
		.filter(i => i.indexOf('platform-restriction-') === 0)
		.map(i => {
			const key = i.substr('platform-restriction-'.length);
			return getPlatformRestrictionTitle(key);
		});
});

const canAddCommunity = computed(
	() =>
		attachedCommunities.value.length < maxCommunities.value &&
		possibleCommunities.value.length > 0
);

const hasChannelError = computed(() => form.hasCustomError('channel'));

const possibleCommunities = computed(() => {
	// Difference between targetable and attached communities.
	return targetableCommunities.value.filter(c1 => {
		// Also exclude the default community. If it is specified,
		// it'll be force-added through the pill-incomplete component.
		if (c1.id === defaultCommunity?.value?.id) {
			return false;
		}

		return !attachedCommunities.value.find(c2 => c1.id === c2.community.id);
	});
});

const shouldShowCommunities = computed(() => {
	return (
		attachedCommunities.value.length > 0 ||
		possibleCommunities.value.length > 0 ||
		incompleteDefaultCommunity.value
	);
});

const incompleteDefaultCommunity = computed(() => {
	// The default community is considered incomplete if the channel for it
	// needs to be selected (default channel is null or the community is not attached to the post).

	const community = defaultCommunity.value;

	if (!(community instanceof Community)) {
		return null;
	}

	const matchingAttachedCommunity = attachedCommunities.value.find(
		i => i.community.id === community.id
	);

	if (matchingAttachedCommunity) {
		return null;
	}

	return community;
});

const submitButtonsEnabled = computed(
	() =>
		form.valid &&
		uploadingVideoStatus.value !== VideoStatus.UPLOADING &&
		!isPollTooShort.value &&
		!isPollTooLong.value
);

const shouldShowAuthorOptions = computed(() => {
	if (!model.value.game || !user.value) {
		return false;
	}

	// Original post authors can always choose whether to share the post on their profile.
	if (user.value.id === model.value.user.id) {
		return true;
	}

	// Otherwise it means we're the resource owner the post was posted on.
	// We can't toggle on sharing the post to profile because its not our post.
	// We can only toggle "as game owner" if the post isn't already shared
	// on the author's profile.
	return !model.value.post_to_user_profile;
});

watch(
	() => form.formModel.post_to_user_profile,
	() => {
		if (form.formModel.post_to_user_profile) {
			form.formModel.as_game_owner = false;
		}
	}
);

watch(
	() => form.formModel.as_game_owner,
	() => {
		if (form.formModel.as_game_owner) {
			form.formModel.post_to_user_profile = false;
		}
	}
);

watch(incompleteDefaultCommunity, () => {
	if (incompleteDefaultCommunity.value) {
		form.setCustomError('channel');
	} else {
		form.clearCustomError('channel');
	}
});

watch(
	() => form.formModel.hasAnyMedia,
	() => {
		if (!form.isLoaded) {
			return;
		}

		let id: number | null = null;

		if (!form.formModel.hasAnyMedia) {
			// If a post is being edited and already has a background, we should
			// default back to that unless they specifically changed the
			// background themselves.
			const usablePostBackgroundId = hasChangedBackground.value
				? null
				: model.value.background?.id || null;

			// Use the post background, if applicable, or try finding a
			// background that matches our Pref.
			id = usablePostBackgroundId ?? _getMatchingBackgroundIdFromPref();
		}
		assignBackgroundId(id);
	}
);

function attachIncompleteCommunity(community: Community, channel: CommunityChannel) {
	attachCommunity(community, channel, false);
}

function attachCommunity(community: Community, channel: CommunityChannel, append = true) {
	// Do nothing if that community is already attached.
	if (attachedCommunities.value.find(i => i.community.id === community.id)) {
		return;
	}

	if (append) {
		attachedCommunities.value.push({ community, channel });
		scrollToAdd();
	} else {
		attachedCommunities.value.unshift({ community, channel });
	}
}

async function scrollToAdd() {
	// Wait for the DOM to update
	await nextTick();
	// Change our scrolling key so AppScrollWhen will bring the 'Add Community' button inview.
	scrollingKey.value *= -1;
}

function removeCommunity(community: Community) {
	const idx = attachedCommunities.value.findIndex(i => i.community.id === community.id);
	if (idx === -1) {
		console.warn('Attempted to remove a community that is not attached');
		return;
	}

	attachedCommunities.value.splice(idx, 1);
}

function onDraftSubmit() {
	form.formModel.status = FiresidePost.STATUS_DRAFT;
}

function onPublishSubmit() {
	form.formModel.status = FiresidePost.STATUS_ACTIVE;
	trackPostPublish();
}

function enableImages() {
	enabledAttachments.value = true;
	attachmentType.value = FiresidePost.TYPE_MEDIA;
}

function onMediaUploaded(mediaItems: MediaItem[]) {
	const newMedia = mediaItems.concat(form.formModel.media);
	form.formModel.media = newMedia;
}

function onMediaUploadFailed(reason: string) {
	let message = $gettext(
		'Something went wrong while we tried uploading your media. Maybe try again?'
	);
	switch (reason) {
		case 'no-dimensions':
			message = $gettext('We failed to analyze your media.');
			break;
		case 'no-image-video':
			message = $gettext(
				'Looks like the file you uploaded is not an image or video we recognize.'
			);
			break;
		case 'no-extension':
			message = $gettext('We could not determine the file type of your media.');
			break;
		case 'invalid-mime-type':
			message = $gettext(
				'We currently do not support the format of your uploaded media. Try exporting it to a different format.'
			);
			break;
	}

	showErrorGrowl(message, $gettext('Failed to upload your media.'));
}

function onMediaSort(mediaItems: MediaItem[]) {
	form.formModel.media = mediaItems;
}

function removeMediaItem(mediaItem: MediaItem) {
	const newMedia = form.formModel.media.filter(item => item.id !== mediaItem.id);
	form.formModel.media = newMedia;
}

function enableVideo() {
	enabledAttachments.value = true;
	attachmentType.value = FiresidePost.TYPE_VIDEO;
}

function disableAttachments() {
	enabledAttachments.value = false;
	attachmentType.value = '';

	form.formModel.media = [];
	form.formModel.videos = [];
}

function toggleLong() {
	longEnabled.value = !longEnabled.value;
}

function createPoll() {
	// Initialize default poll
	form.formModel.poll_days = 1;
	form.formModel.poll_hours = 0;
	form.formModel.poll_minutes = 0;
	form.formModel.poll_item_count = 2;
	for (let i = 0; i < MAX_POLL_ITEMS; i++) {
		(form.formModel[('poll_item' + (i + 1)) as keyof typeof form.formModel] as any) = '';
	}

	form.changed = true;
}

function removePoll() {
	form.formModel.poll_item_count = 0;
	form.changed = true;
}

function removePollItem(idx: number) {
	if (form.formModel.poll_item_count <= 2) {
		return;
	}

	for (let i = idx; i < form.formModel.poll_item_count; i++) {
		(form.formModel[('poll_item' + i) as keyof typeof form.formModel] as any) = (
			form.formModel as any
		)['poll_item' + (i + 1)];
	}

	form.formModel.poll_item_count = form.formModel.poll_item_count - 1;
	form.changed = true;
}

function addPollItem() {
	if (form.formModel.poll_item_count >= MAX_POLL_ITEMS) {
		return;
	}

	(form.formModel[
		('poll_item' + (form.formModel.poll_item_count + 1)) as keyof typeof form.formModel
	] as any) = '';
	form.formModel.poll_item_count = form.formModel.poll_item_count + 1;
	form.changed = true;
}

function enableAccessPermissions() {
	accessPermissionsEnabled.value = true;
}

function disableAccessPermissions() {
	accessPermissionsEnabled.value = false;
}

function addSchedule() {
	if (form.formModel.scheduled_for === null) {
		form.formModel.scheduled_for = startOfDay(addWeeks(Date.now(), 1)).getTime();
	}

	now.value = Date.now();
	form.formModel.scheduled_for_timezone = determine().name();
	form.changed = true;
}

function removeSchedule() {
	form.formModel.scheduled_for_timezone = null;
	form.formModel.scheduled_for = null;
	form.changed = true;
}

async function addPublishingToPlatforms() {
	publishToPlatforms.value = [];
}

function removePublishingToPlatforms() {
	publishToPlatforms.value = null;
}

function isLinkedAccountActive(id: number) {
	return publishToPlatforms.value && publishToPlatforms.value.indexOf(id) !== -1;
}

async function changeLinkedAccount(id: number) {
	if (!publishToPlatforms.value) {
		return;
	}

	const isActive = isLinkedAccountActive(id);
	if (isActive) {
		arrayRemove(publishToPlatforms.value, i => i === id);
	} else {
		publishToPlatforms.value.push(id);
	}

	form.changed = true;
}

function getLinkedAccountDisplayName(account: LinkedAccount) {
	switch (account.provider) {
		case LinkedAccount.PROVIDER_FACEBOOK:
			return account.facebookSelectedPage && account.facebookSelectedPage.name;

		case LinkedAccount.PROVIDER_TUMBLR:
			return account.tumblrSelectedBlog && account.tumblrSelectedBlog.title;

		default:
			return account.name;
	}
}

function getPlatformRestrictionTitle(restriction: string) {
	switch (restriction) {
		case 'twitter-lead-too-long':
			return $gettext(`Your post lead is too long for a tweet.`);
		case 'twitter-gif-file-size-too-large':
			return $gettext(`Twitter doesn't allow GIFs larger than 15MB in filesize.`);
		case 'twitter-too-many-media-items-1-animation':
			return $gettext(`Twitter only allows one GIF per tweet.`);
		case 'twitter-too-many-media-items-4-images':
			return $gettext(`Twitter only allows a max of 4 images per tweet.`);
		case 'twitter-image-file-size-too-large':
			return $gettext(`Twitter doesn't allow images larger than 5MB in filesize.`);
		case 'facebook-media-item-photo-too-large':
			return $gettext(`Facebook doesn't allow images larger than 10MB in filesize.`);
		case 'tumblr-media-item-photo-too-large':
			return $gettext(`Tumblr doesn't allow images larger than 10MB in filesize.`);
	}

	// We do not have the restriction listed here, try and make the topic
	// somewhat readable.
	return $gettextInterpolate(
		`Your post can't be published to the platforms you've selected. Error: %{ error }`,
		{ error: restriction }
	);
}

function timezoneByName(timezone: string) {
	for (const region in timezones.value) {
		const tz = timezones.value[region].find(_tz => _tz.i === timezone);
		if (tz) {
			return tz;
		}
	}
	return null;
}

async function fetchTimezones() {
	// Get timezones list.
	timezones.value = await Timezone.getGroupedTimezones();
	for (const region in timezones.value) {
		for (const tz of timezones.value[region]) {
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

async function onPaste(e: ClipboardEvent) {
	// Do not react to paste events when "Images" is not selected.
	if (!!attachmentType.value && attachmentType.value !== FiresidePost.TYPE_MEDIA) {
		return;
	}
	if (isUploadingPastedImage.value) {
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
	if (!enabledImages.value) {
		enableImages();
	}

	// Upload
	isUploadingPastedImage.value = true;

	const $payload = await Api.sendRequest(
		`/web/posts/manage/add-media/${form.formModel.id}`,
		{},
		{
			file: files,
			progress: e2 => (form.formModel._progress = e2),
			noErrorRedirect: true,
		}
	);

	isUploadingPastedImage.value = false;

	if ($payload.success) {
		// Apply returned media items.
		const mediaItems = MediaItem.populate($payload.mediaItems);
		onMediaUploaded(mediaItems);
	} else {
		onMediaUploadFailed($payload.reason);
	}
}

function onVideoChanged(video: FiresidePostVideo | null) {
	if (video === null) {
		form.formModel.videos = [];
	} else {
		form.formModel.videos = [video];
	}
}

function onUploadingVideoStatusChanged(status: VideoStatus) {
	uploadingVideoStatus.value = status;
	emit('videoUploadStatusChange', uploadingVideoStatus.value);
}

function onVideoProviderChanged(provider: string) {
	videoProvider.value = provider;
}

function onDisableVideoAttachment() {
	disableAttachments();
}

function assignBackgroundId(backgroundId: number | null) {
	const background = backgroundId
		? backgrounds.value.find(i => i.id === backgroundId)
		: undefined;

	form.formModel.background_id = background?.id || null;
	emit('backgroundChange', background);
}

function onBackgroundChanged(backgroundId: number | null) {
	assignBackgroundId(backgroundId);
	SettingPostBackgroundId.set(backgroundId ?? -1);
}

function _getMatchingBackgroundIdFromPref() {
	if (backgrounds.value.length === 0) {
		return null;
	}

	const prefId = SettingPostBackgroundId.get();
	if (prefId === -1) {
		return null;
	}

	// Use the saved ID only if we have an eligible background.
	return backgrounds.value.find(i => i.id == prefId)?.id || null;
}
</script>

<template>
	<AppForm v-if="model" :controller="form">
		<!-- Attachments -->
		<div v-if="!enabledAttachments" class="-attachment-controls">
			<AppButton
				trans
				:primary="enabledImages"
				:solid="enabledImages"
				:overlay="overlay"
				icon="screenshot"
				@click="enableImages()"
			>
				<AppTranslate>Images/GIFs</AppTranslate>
			</AppButton>

			<AppButton
				trans
				:primary="enabledVideo"
				:solid="enabledVideo"
				:overlay="overlay"
				icon="video"
				@click="enableVideo()"
			>
				<AppTranslate>Video</AppTranslate>
			</AppButton>
		</div>
		<div v-else class="well fill-offset full-bleed">
			<!-- Images -->
			<fieldset v-if="enabledImages">
				<AppFormLegend compact deletable @delete="disableAttachments()">
					<AppTranslate>Select images</AppTranslate>
				</AppFormLegend>

				<AppFormPostMedia
					:media-items="form.formModel.media"
					:post="form.formModel"
					:max-filesize="maxFilesize"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:loading="isUploadingPastedImage"
					@upload="onMediaUploaded($event)"
					@error="onMediaUploadFailed($event)"
					@remove="removeMediaItem($event)"
					@sort="onMediaSort($event)"
				/>
			</fieldset>

			<!-- Video -->
			<AppFormPostVideo
				v-else-if="enabledVideo"
				:post="form.formModel"
				:was-published="wasPublished"
				@delete="onDisableVideoAttachment"
				@video-change="onVideoChanged"
				@video-status-change="onUploadingVideoStatusChanged"
				@video-provider-change="onVideoProviderChanged"
			/>
		</div>

		<!-- Post title (short) -->
		<AppFormGroup
			name="lead_content"
			class="-lead-form-group"
			:label="!longEnabled ? $gettext(`Post`) : $gettext(`Summary`)"
			hide-label
		>
			<AppFormControlContent
				content-context="fireside-post-lead"
				autofocus
				:placeholder="
					!longEnabled
						? $gettext(`What's new?`)
						: $gettext(`Write a summary for your article...`)
				"
				:model-id="model.id"
				:min-height="72"
				:validators="[validateContentRequired(), validateContentMaxLength(leadLengthLimit)]"
				@paste="onPaste"
			/>

			<AppTheme :force-dark="overlay">
				<div class="-hp" :class="{ '-overlay-text': overlay }">
					<div class="-hp-label" :class="{ '-overlay': overlay }">HP</div>
					<div class="-hp-bar">
						<AppProgressBar
							thin
							:percent="leadLengthPercent"
							:animate="false"
							:class="{ '-overlay-box': overlay }"
						/>
					</div>
					<div v-if="leadLengthPercent <= 10" class="-hp-count">
						{{ leadLengthLimit - form.formModel.leadLength }}
					</div>
				</div>

				<AppFormGroup
					v-if="backgrounds.length > 0"
					name="background_id"
					class="-backgrounds"
					hide-label
					optional
					:label="$gettext(`Background`)"
				>
					<AppFormControlBackground
						:backgrounds="backgrounds"
						:tile-size="40"
						:disabled-text="backgroundsDisabledText"
						:disabled="!!backgroundsDisabledText"
						@changed="onBackgroundChanged"
					/>
				</AppFormGroup>
			</AppTheme>

			<AppFormControlErrors />
		</AppFormGroup>

		<!-- Post body (long) -->
		<div v-if="longEnabled" class="well fill-offset full-bleed">
			<fieldset>
				<AppFormLegend compact deletable @delete="toggleLong()">
					<AppTranslate>Article content</AppTranslate>
				</AppFormLegend>

				<AppFormGroup
					name="article_content"
					:label="$gettext(`Article Content`)"
					hide-label
					optional
				>
					<AppFormControlContent
						:placeholder="$gettext(`Write your article here...`)"
						content-context="fireside-post-article"
						:model-id="model.id"
						:validators="[
							validateContentNoActiveUploads(),
							validateContentMaxLength(articleLengthLimit),
						]"
						:max-height="0"
					/>

					<AppFormControlErrors />
				</AppFormGroup>
			</fieldset>
		</div>

		<!-- Poll -->
		<div v-if="hasPoll" class="well fill-offset full-bleed">
			<fieldset>
				<AppFormLegend compact :deletable="isPollEditable" @delete="removePoll()">
					<AppTranslate>Set up poll</AppTranslate>
				</AppFormLegend>

				<!-- i starts from 1 -->
				<div v-for="i of form.formModel.poll_item_count" :key="i" class="-poll-option">
					<AppFormGroup :name="'poll_item' + i" :label="$gettext(`choice`)" hide-label>
						<AppFormControl
							type="text"
							:validators="[validateMaxLength(64)]"
							:placeholder="$gettextInterpolate('Choice %{ num }', { num: i })"
							:disabled="!isPollEditable"
						/>

						<AppFormControlErrors />
					</AppFormGroup>

					<!-- Can't have less than 2 poll items -->
					<a
						v-if="form.formModel.poll_item_count > 2 && isPollEditable"
						class="-poll-option-remove link-muted"
						@click="removePollItem(i)"
					>
						<AppJolticon icon="remove" />
					</a>
				</div>

				<div>
					<a
						v-if="isPollEditable && form.formModel.poll_item_count < MAX_POLL_ITEMS"
						@click="addPollItem()"
					>
						+
						<AppTranslate>Add choice</AppTranslate>
					</a>
				</div>
			</fieldset>

			<br />

			<fieldset class="-poll-duration">
				<AppFormLegend compact>
					<AppTranslate>Duration</AppTranslate>
				</AppFormLegend>

				<div class="row">
					<div class="col-xs-4">
						<AppFormGroup name="poll_days" :label="$gettext('Days')" optional>
							<AppFormControl
								type="number"
								step="1"
								min="0"
								max="14"
								:disabled="!isPollEditable"
								:validators="[validateMinValue(0), validateMaxValue(14)]"
							/>
						</AppFormGroup>
					</div>

					<div class="col-xs-4">
						<AppFormGroup name="poll_hours" :label="$gettext('Hours')" optional>
							<AppFormControl
								type="number"
								step="1"
								min="0"
								max="23"
								:disabled="!isPollEditable"
								:validators="[validateMinValue(0), validateMaxValue(23)]"
							/>
						</AppFormGroup>
					</div>

					<div class="col-xs-4">
						<AppFormGroup name="poll_minutes" :label="$gettext('Minutes')" optional>
							<AppFormControl
								type="number"
								step="1"
								min="0"
								max="59"
								:disabled="!isPollEditable"
								:validators="[validateMinValue(0), validateMaxValue(59)]"
							/>
						</AppFormGroup>
					</div>
				</div>

				<p v-if="isPollTooShort" class="help-block error">
					<AppTranslate>
						Too short! Polls must be between 5 minutes and 14 days long.
					</AppTranslate>
				</p>
				<p v-else-if="isPollTooLong" class="help-block error">
					<AppTranslate>
						Too long! Polls must be between 5 minutes and 14 days long.
					</AppTranslate>
				</p>
				<br v-else />
			</fieldset>

			<fieldset>
				<AppFormLegend
					compact
					expandable
					:expanded="isShowingMorePollOptions"
					@click="isShowingMorePollOptions = !isShowingMorePollOptions"
				>
					<AppTranslate>More options</AppTranslate>
				</AppFormLegend>

				<div v-show="isShowingMorePollOptions">
					<AppFormGroup name="poll_is_private" :label="$gettext(`Private results?`)">
						<template #inline-control>
							<AppFormControlToggle />
						</template>

						<p class="help-block sans-margin-top">
							<AppTranslate>
								The poll's results will be kept hidden if this is turned on.
							</AppTranslate>
						</p>
					</AppFormGroup>
				</div>
			</fieldset>
		</div>

		<!-- Scheduling -->
		<div v-if="!wasPublished && isScheduling && timezones" class="well fill-offset full-bleed">
			<fieldset>
				<AppFormLegend compact deletable @delete="removeSchedule()">
					<AppTranslate>Schedule publishing of post</AppTranslate>
				</AppFormLegend>

				<AppFormGroup name="scheduled_for_timezone" :label="$gettext(`Timezone`)">
					<p class="help-block">
						<AppTranslate>
							All time selection below will use this timezone.
						</AppTranslate>
					</p>

					<p class="help-block">
						<strong>
							<AppTranslate>
								Should auto-detect, but if it doesn't, choose your closest city.
							</AppTranslate>
						</strong>
					</p>

					<AppFormControlSelect>
						<optgroup
							v-for="(item, region) of timezones"
							:key="region"
							:label="`${region}`"
						>
							<option v-for="timezone of item" :key="timezone.i" :value="timezone.i">
								{{ timezone.label }}
							</option>
						</optgroup>
					</AppFormControlSelect>

					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="scheduled_for" :label="$gettext(`Date and time`)">
					<AppFormControlDate
						:timezone-offset="scheduledTimezoneOffset"
						:min-date="now"
					/>
					<AppFormControlErrors :label="$gettext(`scheduled for`)" />
				</AppFormGroup>
			</fieldset>
		</div>

		<!-- Access permissions -->
		<template v-if="accessPermissionsEnabled">
			<div v-if="!wasPublished" class="well fill-offset full-bleed">
				<fieldset>
					<AppFormLegend compact deletable @delete="disableAccessPermissions()">
						<AppTranslate>Access permissions</AppTranslate>
					</AppFormLegend>

					<AppFormGroup
						name="key_group_ids"
						:label="$gettext(`Access Permissions`)"
						hide-label
					>
						<div v-if="!keyGroups.length" class="alert">
							<AppTranslate>
								You can make this post available to only the users within a key
								group. For example, this is useful for sending news updates to
								testers. You can create a user key group through the "Keys/Access"
								page.
							</AppTranslate>
						</div>
						<div v-else>
							<p class="help-block">
								<AppTranslate>
									You can make this post available to only the users within a key
									group. For example, this is useful for sending news updates to
									testers. Only User-type key groups can be selected.
								</AppTranslate>
							</p>

							<div v-for="keyGroup of keyGroups" :key="keyGroup.id" class="checkbox">
								<label>
									<AppFormControlCheckbox :value="keyGroup.id" />
									{{ keyGroup.name }}
								</label>
							</div>
						</div>
					</AppFormGroup>
				</fieldset>
			</div>
			<div v-else class="form-group well fill-offset full-bleed">
				<label class="control-label">
					<AppTranslate>Access Permissions</AppTranslate>
				</label>
				<div class="alert">
					<AppTranslate>
						The below key groups have access to this post. You can't edit who has access
						after posting since notifications have already gone out.
					</AppTranslate>
				</div>
				<div>
					<span v-for="keyGroup of model.key_groups" :key="keyGroup.id" class="tag">
						{{ keyGroup.name }}
					</span>
				</div>
			</div>
		</template>

		<!-- Other platforms -->
		<div v-if="isPublishingToPlatforms" class="well fill-offset full-bleed">
			<fieldset>
				<AppFormLegend compact deletable @delete="removePublishingToPlatforms()">
					<AppTranslate>Publish your post to other platforms</AppTranslate>
				</AppFormLegend>

				<div v-if="!linkedAccounts.length" class="alert">
					<AppTranslate>You can publish this post to other platforms!</AppTranslate>
					{{ ' ' }}
					<AppTranslate v-if="!model.game">
						Set up your linked accounts in your user account.
					</AppTranslate>
					<AppTranslate v-else>
						Set up your linked accounts either in your game dashboard, or your user
						account.
					</AppTranslate>
				</div>
				<div v-else class="-linked-accounts">
					<AppFormGroup
						v-for="account of linkedAccounts"
						:key="account.id"
						:name="`linked_account_${account.id}`"
						:label="$gettext(`Linked Account`)"
						hide-label
					>
						<div class="-linked-account">
							<div class="-linked-account-icon">
								<AppJolticon
									v-app-tooltip="account.providerDisplayName"
									:icon="account.icon"
									big
								/>
							</div>

							<div class="-linked-account-label">
								{{ getLinkedAccountDisplayName(account) }}
							</div>

							<div class="-linked-account-toggle">
								<AppFormControlToggle @changed="changeLinkedAccount(account.id)" />
							</div>
						</div>
					</AppFormGroup>
				</div>
			</fieldset>
		</div>

		<div v-if="hasPublishedToPlatforms" class="alert">
			<strong>
				<AppTranslate>This post has been published to other platforms.</AppTranslate>
			</strong>
			<AppTranslate>
				Any edits made to this post will not be reflected on those other platforms.
			</AppTranslate>
		</div>

		<template v-if="platformRestrictions.length">
			<div
				v-for="restriction of platformRestrictions"
				:key="restriction"
				class="alert alert-notice full-bleed anim-fade-in"
			>
				<strong>
					{{ restriction }}
				</strong>
			</div>
		</template>

		<!-- Communities -->
		<template v-if="form.isLoaded">
			<AppScrollScroller v-if="shouldShowCommunities" class="-communities" horizontal thin>
				<transition-group tag="div" class="-communities-list">
					<AppFormsCommunityPillIncomplete
						v-if="incompleteDefaultCommunity"
						key="incomplete"
						class="-community-pill anim-fade-in-enlarge no-animate-leave"
						:communities="possibleCommunities"
						:community="incompleteDefaultCommunity"
						@add="attachIncompleteCommunity"
					/>

					<AppFormsCommunityPill
						v-for="{ community, channel } of attachedCommunities"
						:key="community.id"
						class="-community-pill anim-fade-in-enlarge no-animate-leave"
						:community="community"
						:channel="channel"
						:removable="!wasPublished"
						@remove="removeCommunity(community)"
					/>

					<template v-if="!wasPublished && canAddCommunity">
						<AppFormsCommunityPillAdd
							key="add"
							v-app-scroll-when="scrollingKey"
							class="-community-pill anim-fade-in-enlarge no-animate-leave"
							:communities="possibleCommunities"
							@add="attachCommunity"
						/>
					</template>
				</transition-group>
			</AppScrollScroller>
			<p v-else-if="!wasPublished" class="help-block">
				<AppTranslate>Join some communities to post to them.</AppTranslate>
				<span v-app-tooltip.touchable="$gettext(`Go to the explore page and find some!`)">
					<AppJolticon class="text-muted" icon="help-circle" />
				</span>
			</p>
		</template>
		<template v-else>
			<div class="-communities-list-placeholder">
				<div class="-community-pill-placeholder" />
			</div>
		</template>

		<div v-if="!wasPublished" class="-error-no-channel">
			<div class="-caret" :class="{ '-hide': !hasChannelError }" />
			<AppExpand :when="hasChannelError">
				<div class="-error -earmark alert alert-notice">
					<AppTranslate>Choose a channel to post to.</AppTranslate>
				</div>
			</AppExpand>
		</div>

		<!-- Author options -->
		<AppTheme
			v-if="shouldShowAuthorOptions"
			:class="{ '-overlay-text': overlay }"
			:force-dark="overlay"
		>
			<fieldset>
				<!-- Post to profile -->
				<AppFormGroup
					v-if="user && user.id == model.user.id"
					name="post_to_user_profile"
					class="sans-margin-bottom"
					:label="$gettext(`Post to Profile`)"
				>
					<template #inline-control>
						<AppFormControlToggle />
					</template>

					<p class="help-block sans-margin-top" :class="{ '-text-white': overlay }">
						This will post to your profile as well as the game page.
					</p>
				</AppFormGroup>

				<!-- Post as game owner -->
				<AppFormGroup
					v-if="model.game && model.user.id != model.game.developer.id"
					name="as_game_owner"
					:label="$gettext(`Post as Game Owner`)"
				>
					<template #inline-control>
						<AppFormControlToggle />
					</template>

					<div
						v-if="form.formModel.as_game_owner"
						v-app-tooltip.touchable="
							model.game.developer.display_name +
							` (@${model.game.developer.username})`
						"
						class="-author-avatar pull-right"
					>
						<AppUserAvatarImg :user="model.game.developer" />
					</div>
					<p class="help-block sans-margin-top" :class="{ '-text-white': overlay }">
						<AppTranslate
							:translate-params="{
								owner: `@${model.game.developer.username}`,
								author: `@${model.user.username}`,
							}"
						>
							This will show %{ owner } as the user that posted.
						</AppTranslate>
					</p>
				</AppFormGroup>
			</fieldset>
		</AppTheme>

		<!-- Controls -->
		<div class="-controls">
			<div class="-controls-attachments" :class="{ '-overlay-text': overlay }">
				<AppButton
					v-if="!longEnabled"
					v-app-tooltip="$gettext(`Add Article`)"
					sparse
					trans
					circle
					icon="blog-article"
					@click="toggleLong()"
				/>

				<AppButton
					v-if="!hasPoll"
					v-app-tooltip="$gettext(`Add Poll`)"
					sparse
					trans
					circle
					icon="pedestals-numbers"
					@click="createPoll()"
				/>

				<AppButton
					v-if="!wasPublished && !isScheduling"
					v-app-tooltip="$gettext(`Schedule Post`)"
					sparse
					trans
					circle
					icon="calendar-grid"
					@click="addSchedule()"
				/>

				<AppButton
					v-if="!accessPermissionsEnabled && !wasPublished && model.game"
					v-app-tooltip="$gettext(`Access Permissions`)"
					sparse
					trans
					circle
					icon="key-diagonal"
					@click="enableAccessPermissions()"
				/>

				<AppButton
					v-if="!wasPublished && !isPublishingToPlatforms"
					v-app-tooltip="$gettext(`Publish to Other Platforms`)"
					sparse
					trans
					circle
					icon="share-airplane"
					@click="addPublishingToPlatforms()"
				/>
			</div>

			<AppTheme :force-dark="overlay" class="-controls-submit">
				<div class="-controls-submit-button">
					<AppFormButton
						v-if="!wasPublished && !isScheduling"
						:disabled="!submitButtonsEnabled"
						:solid="false"
						:primary="false"
						trans
						:block="Screen.isXs"
						:overlay="overlay"
						@before-submit="onDraftSubmit()"
					>
						<AppTranslate>Save Draft</AppTranslate>
					</AppFormButton>
				</div>
				{{ ' ' }}
				<div class="-controls-submit-button">
					<AppFormButton
						:disabled="!submitButtonsEnabled"
						primary
						solid
						:block="Screen.isXs"
						:overlay="overlay"
						@before-submit="onPublishSubmit()"
					>
						{{ mainActionText }}
					</AppFormButton>
				</div>
			</AppTheme>
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
@import '../community/_pill/variables'

.form-group:last-child
	margin-bottom: 10px

.-attachment-controls
	margin-bottom: $line-height-computed

	@media $media-xs
		white-space: nowrap
		overflow-x: scroll
		overflow-y: hidden

.-upload-input
	display: none

.-lead-form-group
	margin-bottom: 10px

.-hp
	display: flex
	align-items: center
	margin-top: 5px

.-hp-label
	theme-prop('color', 'fg-muted')
	flex: none
	margin-right: 10px
	font-size: $font-size-small
	font-weight: bold

	&.-overlay
		theme-prop('color', 'fg')

.-hp-bar
	flex: auto

	.progress
		margin-bottom: 0

.-hp-count
	theme-prop('color', 'notice')
	flex: none
	margin-left: 10px
	font-size: $font-size-small
	font-weight: bold

.-backgrounds
	margin-top: 8px
	margin-bottom: 16px

.-channels
	margin-top: 10px

.-channels
.-error
.-community-message
	margin-bottom: 10px

.-error-no-channel
	position: relative

	.alert
		padding: 10px !important

	.-caret
		caret(color: var(--theme-notice), direction: 'up', size: 5px)
		left: 15%
		transition: opacity 200ms

		&.-hide
			opacity: 0

.-poll-option
	display: flex

	.form-group
		flex-grow: 1
		margin-bottom: ($font-size-base / 2)

.-poll-option-remove
	width: 40px
	line-height: $input-height-base
	text-align: center

.-poll-duration
	.form-group
		margin-bottom: 0

.-linked-accounts
	.form-group
		margin-bottom: 0

.-linked-account
	display: flex
	align-items: center
	margin-top: 10px

.-linked-account-icon
	flex: none
	margin-right: 10px

.-linked-account-label
	flex: auto
	margin-right: 10px

.-linked-account-toggle
	flex: none

.-communities
	margin: 10px 0

.-communities-list
	white-space: nowrap
	display: flex
	align-items: center
	margin-bottom: 4px

	.v-leave-from
		display: none
		position: absolute

.-communities-list-placeholder
	margin: 10px 0 14px

.-community-pill
	flex-shrink: 0

	// Need to apply to the button inside the pill add component too
	&
	::v-deep(.button)
		height: 28px
		margin-bottom: 0

.-community-pill-placeholder
	change-bg('bg-subtle')
	rounded-corners()
	width: 138px
	height: $pill-height

.-author-avatar
	width: $input-height-base
	margin-right: 8px

@media $media-xs
	.-controls
		display: flex
		flex-direction: column

	.-controls-attachments
		display: flex
		justify-content: center
		margin-bottom: $line-height-computed
		padding: 10px 0
		border-top: $border-width-base solid var(--theme-bg-subtle)
		border-bottom: $border-width-base solid var(--theme-bg-subtle)

		> :not(:first-child)
			margin-left: 10px

	.-controls-submit
		display: flex

	.-controls-submit-button
		flex: 1 0
		margin-right: 10px
		margin-left: 10px

		&:first-of-type
			margin-left: 0

		&:last-of-type
			margin-right: 0

@media $media-sm-up
	.-controls
		display: flex
		flex-direction: row

	.-controls-attachments
		flex: auto

	.-controls-submit
		flex: none

	.-controls-submit-button
		display: inline-block

.-overlay-text
	&
	& > *
		text-shadow: black 1px 1px 4px
		color: white

.-text-white
	color: white !important

.-overlay-box
	elevate-1()
</style>
