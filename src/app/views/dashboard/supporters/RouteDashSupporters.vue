<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppAlertBox from '../../../../_common/alert/AppAlertBox.vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { ContentDocument } from '../../../../_common/content/content-document';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { SupporterActionModel } from '../../../../_common/supporters/action.model';
import { SupporterMessageModel } from '../../../../_common/supporters/message.model';
import { showDoSupporterMessageModal } from '../../../../_common/supporters/message/do/modal.service';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { getCurrentServerTime } from '../../../../utils/server-time';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';

const ACTIONS_PER_PAGE = 25;
const InviewConfigLoadMore = new ScrollInviewConfig({ margin: `${Screen.height}px` });

export default {
	...defineAppRouteOptions({
		deps: {},
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
let _sendAllInterval: NodeJS.Timer | null = null;

/**
 * Actions older than this cannot be thanked.
 *
 * Duration in seconds.
 */
const replyTimeLimit = ref<number>(7 * 24 * 60 * 60);
const isSending = ref(false);
const canSendAll = ref(false);
const isLoadingMore = ref(false);
const hasError = ref(false);
const reachedEnd = ref(false);

const actions = ref([]) as Ref<SupporterActionModel[]>;
const templateMessage = ref<SupporterMessageModel>({ content: '{}' } as SupporterMessageModel);

const routeTitle = computed(() => $gettext(`Your Supporters`));
const sendAllUrl = computed(() => `/web/dash/creators/supporters/send_all`);
const canSubmitSendAll = computed(() => !isSending.value && canSendAll.value && hasTemplate.value);

const hasTemplate = computed(() => {
	const content = templateMessage.value.content;
	if (!content || !content.length) {
		return false;
	}

	return ContentDocument.fromJson(content).hasContent;
});

const { reload } = createAppRoute({
	routeTitle,
	onResolved(data) {
		const payload: InitPayload = data.payload;
		const rawActions = payload.actions;

		if (rawActions.length) {
			actions.value = SupporterActionModel.populate(rawActions);
		} else {
			actions.value = [];
		}

		// We'll reload this route after sending to everyone. Ensure we're
		// resetting state as needed.
		templateMessage.value = new SupporterMessageModel(payload.templateMessage);
		replyTimeLimit.value = payload.replyTimeLimit;
		isSending.value = payload.isSending === true;
		canSendAll.value = payload.canSendAll === true;
		isLoadingMore.value = false;
		hasError.value = false;
		reachedEnd.value = rawActions.length < ACTIONS_PER_PAGE;
	},
	onDestroyed() {
		clearSendAllInterval();
	},
});

function clearSendAllInterval() {
	if (_sendAllInterval) {
		clearInterval(_sendAllInterval);
		_sendAllInterval = null;
	}
}

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
			actions.value.push(...SupporterActionModel.populate(response.actions));
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

async function _checkSendAll() {
	try {
		const response = await Api.sendFieldsRequest('/mobile/dash/creators/supporters', {
			isSending: true,
		});

		isSending.value = response.isSending === true;
		if (isSending.value) {
			return;
		}

		clearSendAllInterval();

		// Reload the page when we've determined we're no longer sending
		// messages.
		reload();
	} catch (e) {
		console.error(e);
		clearSendAllInterval();
	}
}

async function onClickSendAll() {
	if (isSending.value) {
		showErrorGrowl($gettext(`You already have messages being sent. Please try again later.`));
		return;
	}

	const shouldSend = await showModalConfirm(
		$gettext(
			`Are you sure you want to thank your recent supporters using your existing message template? Each person will only get one message.`
		)
	);

	if (!shouldSend) {
		return;
	}

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
			isSending.value = false;
			return;
		}

		clearSendAllInterval();
		_sendAllInterval = setInterval(_checkSendAll, 5_000);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Something went wrong`));
		isSending.value = false;
	}
}

async function onClickEdit() {
	const newTemplate = await showDoSupporterMessageModal({
		model: templateMessage.value,
	});

	if (!newTemplate) {
		return;
	}

	templateMessage.value = newTemplate;
}

async function onClickCreateCustom(action: SupporterActionModel) {
	const sentMessage = await showDoSupporterMessageModal({
		model: action.message,
		action,
	});

	if (!sentMessage) {
		return;
	}

	if (action.message) {
		action.message.assign(sentMessage);
	} else {
		action.message = sentMessage;
	}
}

function _isActionStale(action: SupporterActionModel) {
	return getCurrentServerTime() - action.added_on >= replyTimeLimit.value * 1_000;
}

function _canThankSupporterAction(action: SupporterActionModel) {
	if (action.isThanked || action.message?.skipped_on) {
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
					<div class="well sans-margin-bottom fill-bg" style="width: 100%">
						<h4 class="sans-margin-top">
							{{ $gettext(`Message template`) }}
						</h4>

						<template v-if="templateMessage && hasTemplate">
							<AppContentViewer
								class="-message-viewer"
								:source="templateMessage.content"
							/>

							<a class="link-muted" @click="onClickEdit">
								{{ $gettext(`Edit template`) }}
							</a>
						</template>
						<template v-else>
							<p>
								{{
									$gettext(
										`Set up a message template that you can then use to send messages to all recent supporters at once.`
									)
								}}
							</p>

							<AppButton class="-template-action" solid @click="onClickEdit">
								{{ $gettext(`Create template`) }}
							</AppButton>
						</template>
					</div>
				</div>
			</div>

			<AppSpacer vertical :scale="4" />

			<AppExpand :when="isSending">
				<AppAlertBox icon="lock" color="primary" fill-color="offset">
					{{
						$gettext(
							`We're processing your outgoing messages right now. You'll be able to thank more users once this is finished.`
						)
					}}
				</AppAlertBox>
			</AppExpand>

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

							<div class="-user-info">
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

						<div v-if="!action.message && !_isActionStale(action) && isSending">
							<AppLoading stationary hide-label centered />
						</div>
						<div v-else-if="_canThankSupporterAction(action)" class="-thanks">
							<AppButton @click="onClickCreateCustom(action)">
								{{ $gettext(`Say thanks`) }}
							</AppButton>
						</div>
						<div v-else class="-thanks-message">
							<template v-if="action.message && action.message.skipped_on">
								<div class="-subtle-header">
									{{ $gettext(`Message skipped`) }}
								</div>

								<AppContentViewer
									class="-message-viewer"
									:source="action.message.content"
								/>

								<div class="well sans-margin-bottom fill-offset small">
									{{
										$gettext(
											`This user supported you multiple times before you said thank you to everyone, so we only notified them once.`
										)
									}}
								</div>
							</template>
							<template v-else-if="action.message">
								<div class="-subtle-header">
									{{ $gettext(`Message sent`) }}
								</div>

								<AppContentViewer
									class="-message-viewer"
									:source="action.message.content"
								/>
							</template>
							<template v-else-if="_isActionStale(action)">
								<div class="-subtle-header">
									{{ $gettext(`Expired`) }}
								</div>

								<div class="well sans-margin-bottom fill-offset small">
									{{ $gettext(`This action can no longer be thanked.`) }}
								</div>
							</template>
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

		.-user
			width: auto

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

.-user-info
	flex: auto
	min-width: 0

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
	flex: 1 1

.-subtle-header
	font-size: $font-size-small
	color: var(--theme-fg-muted)

.-thanks
	flex: none
	height: 42px
	display: inline-flex
	align-items: center

.-thanks-message
	flex: 2 1

	> .-message-viewer
		height: auto
</style>
