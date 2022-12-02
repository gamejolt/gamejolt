<script lang="ts">
const ACTIONS_PER_PAGE = 25;

// TODO(supporter-messages) Route isn't currently linked to anywhere.
export default {
	...defineAppRouteOptions({
		resolver: () =>
			Api.sendFieldsRequest('/mobile/dash/creators/supporters', {
				actions: {
					perPage: ACTIONS_PER_PAGE,
				},
				templateMessage: true,
				replyTimeLimit: true,
				isSending: true,
				canSendAll: true,
			}),
	}),
};

type InitPayload = {
	actions: any[];
	templateMessage: string;
	replyTimeLimit: number;
	isSending: boolean;
	canSendAll: boolean;
};
</script>

<script lang="ts" setup>
import { computed, ref, shallowRef } from 'vue';
import { RouterLink } from 'vue-router';
import { getCurrentServerTime } from '../../../../utils/server-time';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { ContentDocument } from '../../../../_common/content/content-document';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { SupporterAction } from '../../../../_common/supporters/action.model';
import { SupporterMessage } from '../../../../_common/supporters/message.model';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import { SupporterMessageModal } from './message/modal.service';

const InviewConfigLoadMore = new ScrollInviewConfig({ margin: `${Screen.height}px` });

const routeTitle = computed(() => $gettext(`Your Supporters`));

const actions = shallowRef<SupporterAction[]>([]);

const isLoadingMore = ref(false);
const hasError = ref(false);
const reachedEnd = ref(false);

const templateMessage = ref<SupporterMessage>({ content: '{}' } as SupporterMessage);

/**
 * Actions older than this cannot be thanked.
 *
 * Duration in seconds.
 */
const replyTimeLimit = ref<number>(7 * 24 * 60 * 60);
const isSending = ref(false);
const canSendAll = ref(false);

const sendAllUrl = computed(() => `/web/dash/creators/supporters/send_all`);

const canSubmitSendAll = computed(() => !isSending.value && canSendAll.value && hasTemplate.value);

const hasTemplate = computed(() => {
	const content = templateMessage.value.content;
	if (!content || !content.length) {
		return false;
	}

	return ContentDocument.fromJson(content).hasContent;
});

createAppRoute({
	routeTitle,
	onResolved(data) {
		const payload: InitPayload = data.payload;

		if (payload.actions.length) {
			actions.value = SupporterAction.populate(payload.actions);
		} else {
			reachedEnd.value = true;
		}

		templateMessage.value = new SupporterMessage(payload.templateMessage);
		replyTimeLimit.value = payload.replyTimeLimit;

		isSending.value = payload.isSending === true;
		canSendAll.value = payload.canSendAll === true;
	},
});

async function loadMore() {
	if (isLoadingMore.value || hasError.value || !actions.value.length) {
		return;
	}

	isLoadingMore.value = true;
	const newPos = actions.value[actions.value.length - 1].added_on;

	try {
		const response = await Api.sendFieldsRequest('/mobile/dash/creators/supporters', {
			actions: {
				perPage: ACTIONS_PER_PAGE,
				pos: newPos,
			},
		});

		if (response.actions.length) {
			actions.value.push(...SupporterAction.populate(response.actions));
		}

		if (!response.actions || response.actions.length < ACTIONS_PER_PAGE) {
			reachedEnd.value = true;
		}
	} catch (e) {
		console.error(e);
		hasError.value = true;
	} finally {
		isLoadingMore.value = false;
	}
}

async function onClickSendAll() {
	const shouldSend = await ModalConfirm.show(
		$gettext(
			`Are you sure you want to thank your recent supporters using your existing message template?`
		)
	);

	if (!shouldSend) {
		return;
	}

	const wasSending = isSending.value;
	isSending.value = true;
	try {
		const response = await Api.sendRequest(
			sendAllUrl.value,
			{},
			{
				detach: true,
			}
		);

		if (!response.success) {
			const { errors = {} } = response;
			let message: string | undefined;

			if (errors.sending) {
				message = $gettext(`You already have messages being sent. Please try again later.`);
			}

			if (!message) {
				message = $gettext(`Something went wrong`);
			}

			showErrorGrowl(message);
			return;
		}
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Something went wrong`));
		isSending.value = wasSending;
	}
}

async function onClickEdit() {
	const newTemplate = await SupporterMessageModal.show({
		model: templateMessage.value,
	});

	if (!newTemplate) {
		return;
	}

	templateMessage.value = newTemplate;
}

async function onClickCreateCustom(action: SupporterAction) {
	const sentMessage = await SupporterMessageModal.show({
		model: action.message,
		action,
	});

	if (!sentMessage) {
		return;
	}

	// TODO(supporter-messages) doesn't render the new content
	if (action.message) {
		action.message.assign(sentMessage);
	} else {
		action.message = sentMessage;
	}
}

function _isActionStale(action: SupporterAction) {
	return getCurrentServerTime() - action.added_on >= replyTimeLimit.value * 1_000;
}

function _canThankSupporterAction(action: SupporterAction) {
	if (action.isThanked) {
		return false;
	}

	return !_isActionStale(action);
}
</script>

<template>
	<AppShellPageBackdrop>
		<div class="container">
			<AppSpacer vertical :scale="10" />

			<div class="-template">
				<div class="well sans-margin-bottom fill-bg">
					<h4 class="sans-margin-top">
						{{ $gettext(`Say thank you!`) }}
					</h4>

					<div>
						{{
							$gettext(
								`Create a message you can send to all your recent supporters at once, or go through the list and send custom messages to show your appreciation!`
							)
						}}
					</div>
				</div>

				<div class="-template-viewer">
					<template v-if="templateMessage && hasTemplate">
						<AppContentViewer
							class="-message-viewer fill-bg form-control content-editor-form-control"
							:source="templateMessage.content"
						/>

						<a class="link-muted" @click="onClickEdit">
							{{ $gettext(`Edit template`) }}
						</a>
					</template>
					<template v-else>
						<div class="well sans-margin-bottom fill-bg" style="width: 100%">
							<p>
								{{ $gettext(`You haven't created a message template yet.`) }}
							</p>

							<AppButton class="-template-action" solid @click="onClickEdit">
								{{ $gettext(`Create template`) }}
							</AppButton>
						</div>
					</template>
				</div>
			</div>

			<AppSpacer vertical :scale="4" />

			<div class="-row -flex-wrap">
				<h1 class="-auto-flex sans-margin-bottom">
					{{ $gettext(`Latest Supporters`) }}
				</h1>

				<AppButton
					v-if="canSubmitSendAll"
					class="-template-action"
					style="margin-left: auto"
					solid
					primary
					@click="onClickSendAll"
				>
					{{ $gettext(`Thank everyone`) }}
				</AppButton>
			</div>

			<AppSpacer vertical :scale="10" />

			<template v-for="action of actions" :key="action.id">
				<div class="-item-wrapper">
					<div v-if="action.isChargedSticker" class="-support-type">
						<AppJolticon icon="sticker-filled" />

						{{ $gettext(`Charged sticker`) }}
					</div>

					<div class="-item sheet sheet-offset">
						<RouterLink class="-user" :to="action.user.routeLocation">
							<div class="-user-avatar">
								<AppUserAvatarImg :user="action.user" />
							</div>

							<div>
								<div class="-display-name">
									{{ action.user.display_name }}
								</div>

								<div class="-username">@{{ action.user.username }}</div>
							</div>
						</RouterLink>

						<div class="-resource-wrapper">
							<template v-if="action.post">
								<div class="-subtle-header">
									{{ $gettext(`Post`) }}
								</div>

								<div class="-resource-content">
									<RouterLink :to="action.post.routeLocation">
										{{ action.post.getShortLead() }}
									</RouterLink>
								</div>
							</template>
							<template v-else-if="action.fireside">
								<div class="-subtle-header">
									{{ $gettext(`Fireside`) }}
								</div>

								<div class="-resource-content">
									{{ action.fireside.title }}
								</div>
							</template>
						</div>

						<div v-if="_canThankSupporterAction(action)" class="-thanks">
							<AppButton @click="onClickCreateCustom(action)">
								{{ $gettext(`Say thanks`) }}
							</AppButton>
						</div>
						<div v-else-if="action.message" class="-thanks-message">
							<div class="-subtle-header">
								{{ $gettext(`Message sent`) }}
							</div>

							<AppContentViewer
								class="-message-viewer fill-offset form-control content-editor-form-control"
								:source="action.message.content"
							/>
						</div>
						<div v-else-if="_isActionStale(action)">
							<div class="-subtle-header">
								{{ $gettext(`Expired`) }}
							</div>

							<div class="well sans-margin-bottom fill-offset">
								{{ $gettext(`This action can no longer be thanked.`) }}
							</div>
						</div>
					</div>
				</div>

				<AppSpacer vertical :scale="8" />
			</template>

			<template v-if="!reachedEnd">
				<AppScrollInview
					v-if="!isLoadingMore"
					:config="InviewConfigLoadMore"
					@inview="loadMore()"
				/>
				<AppLoading v-else class="-loading-more" centered />
			</template>
		</div>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
.-template
	display: flex
	gap: 24px
	align-items: flex-start

	> *
		flex: 1 1 50%

	@media $media-xs
		flex-direction: column
		align-items: stretch
		gap: 16px

.-template-viewer
	display: flex
	flex-direction: column
	align-items: flex-end
	gap: 12px

.-message-viewer
	height: 100%

.-template-actions
	display: flex
	justify-content: flex-end
	flex-wrap: wrap
	gap: 8px 12px

.-template-action
	margin: 0

.-row
	display: flex
	gap: 8px
	align-items: flex-end

.-flex-wrap
	flex-wrap: wrap

.-auto-flex
	flex: auto

.-item-wrapper
	position: relative

.-support-type
	rounded-corners()
	position: absolute
	font-size: $font-size-small
	background-color: var(--theme-bg-offset)
	height: 30px
	line-height: 30px
	padding: 0 8px
	left: 8px
	top: -(@height / 2 + 4px)

.-item
	display: flex
	grid-gap: 32px

	@media $media-sm-up
		margin: 0
		align-items: flex-start

	@media $media-xs
		flex-direction: column
		grid-gap: 16px

		.-resource-wrapper
			flex-basis: auto

		.-thanks
			margin-left: auto

.-user
	width: 20%
	flex: none
	display: flex
	grid-gap: 8px
	align-items: center
	font-weight: bold

.-user-avatar
	width: 42px
	flex: none

.-display-name
.-username
	text-overflow()
	min-width: 0
	max-width: 100%

.-display-name
	font-weight: bold
	font-size: $font-size-base

.-username
	font-size: $font-size-small

.-resource-wrapper
	flex: 1 1 200px

.-subtle-header
	font-size: $font-size-small
	color: var(--theme-fg-muted)

.-thanks
	flex: none
	height: 42px
	display: inline-flex
	align-items: center

.-thanks-message
	flex: 1 1 auto
	min-width: 100px

	> .-message-viewer
		height: auto
</style>
