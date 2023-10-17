<script lang="ts" setup>
import { CSSProperties, computed, nextTick, onMounted, onUnmounted, ref, toRefs, watch } from 'vue';
import { Api } from '../../../../api/api.service';
import AppJolticon from '../../../../jolticon/AppJolticon.vue';
import AppLoading from '../../../../loading/AppLoading.vue';
import { Screen } from '../../../../screen/screen-service';
import { $gettext } from '../../../../translate/translate.service';
import AppUserVerifiedTick from '../../../../user/AppUserVerifiedTick.vue';
import AppUserAvatarImg from '../../../../user/user-avatar/AppUserAvatarImg.vue';
import { UserModel } from '../../../../user/user.model';
import { editorInsertMention, useContentEditorController } from '../../content-editor-controller';
import ContentEditorMentionCache from './cache.service';

const props = defineProps({
	canShow: {
		type: Boolean,
		required: true,
	},
});

const { canShow } = toRefs(props);
const controller = useContentEditorController()!;

const query = ref(''); // Currently active suggestion query
const selectedIndex = ref(0);
const isListening = ref(false); // If we are listening to the document keydown event, to be able to unbind it later.
const remoteSuggestionDebounceTimeout = ref<NodeJS.Timer | null>(null); // Timeout between requests to search backend
const isLoading = ref(false); // Loading more users from backend
const users = ref<UserModel[]>([]);
const container = ref<HTMLElement>();
const list = ref<HTMLDivElement>();

const emit = defineEmits({
	insert: () => true,
	'user-change': (_count: number) => true,
});

const displayUsers = computed(() =>
	isInverted.value ? users.value.slice().reverse() : users.value
);

const showControl = computed(() => visible.value && (isLoading.value || users.value.length > 0));

const visible = computed(() => controller.capabilities.hasMentionControls && canShow.value);

// If the text control is more than 50% down the page, open the control
// above ("inverted")
const isInverted = computed(() => (controller.window.top ?? 0) / Screen.height >= 0.5);

const styles = computed<CSSProperties>(() => {
	const {
		relativeCursorTop,
		window: { left },
	} = controller;
	const offset = relativeCursorTop + 30 + 'px';

	return {
		top: isInverted.value ? 'auto' : offset,
		bottom: isInverted.value ? offset : 'auto',
		left: Screen.isXs ? `-${left}px` : 'auto',
		visibility: showControl.value ? 'visible' : 'hidden',
	};
});

const mention = computed(() => controller.capabilities.mention);

watch(mention, () => onMentionChange());

watch(
	() => users.value.length,
	newSize => {
		emit('user-change', newSize);
	}
);

onMounted(() => {
	onMentionChange();
	document.addEventListener('keydown', onKeyDown);
	isListening.value = true;
});

onUnmounted(() => {
	if (isListening.value) {
		document.removeEventListener('keydown', onKeyDown);
		isListening.value = false;
	}

	if (remoteSuggestionDebounceTimeout.value) {
		clearTimeout(remoteSuggestionDebounceTimeout.value);
		remoteSuggestionDebounceTimeout.value = null;
	}
});

function onMentionChange() {
	if (!visible.value) {
		emit('user-change', 0);
		return;
	}
	query.value = mention.value;
	updateSuggestions(query.value);
}

async function updateSuggestions(queryInput: string) {
	// Stop any existing queued search timeout.
	if (remoteSuggestionDebounceTimeout.value) {
		clearTimeout(remoteSuggestionDebounceTimeout.value);
		remoteSuggestionDebounceTimeout.value = null;
		isLoading.value = false;
	}

	selectedIndex.value = 0;
	// If we already have the search results cached, use those and don't query backend.
	if (ContentEditorMentionCache.hasResults(queryInput)) {
		users.value = ContentEditorMentionCache.getResults(queryInput);
		await handleInverted();
	} else {
		users.value = [];

		// We set a timeout here to not send right away when the user is typing fast.
		remoteSuggestionDebounceTimeout.value = setTimeout(async () => {
			isLoading.value = true;

			const payload = await Api.sendRequest(
				'/web/search/mention-suggestions?q=' + encodeURIComponent(queryInput),
				undefined,
				{ detach: true }
			);

			if (payload.users) {
				const searchUsers = UserModel.populate(payload.users);

				// Add to cache
				ContentEditorMentionCache.setResults(queryInput, searchUsers);

				// Only process results if the currently active suggestion is still the one we initiated the search with.
				if (queryInput === query.value) {
					users.value = searchUsers;
					await handleInverted();
				}
			}

			isLoading.value = false;
		}, 500);
	}
}

async function handleInverted() {
	// If we are inverted, scroll the container down.
	if (isInverted.value && list.value) {
		// Need to wait here for the list to get bootstrapped before scrolling it.
		await nextTick();
		list.value.scrollTop = list.value.scrollHeight;
	}
}

function isSelected(userId: number) {
	return users.value[selectedIndex.value].id === userId;
}

async function onKeyDown(e: KeyboardEvent) {
	if (visible.value && users.value.length > 0) {
		let direction = '';
		if (e.key === 'ArrowDown') {
			direction = isInverted.value ? 'up' : 'down';
		} else if (e.key === 'ArrowUp') {
			direction = isInverted.value ? 'down' : 'up';
		}

		if (direction === 'down' && selectedIndex.value < users.value.length - 1) {
			selectedIndex.value++;
			e.stopPropagation();
			e.preventDefault();
		} else if (direction === 'up' && selectedIndex.value > 0) {
			selectedIndex.value--;
			e.stopPropagation();
			e.preventDefault();
		} else if (e.key === 'Enter' || e.key === 'Tab') {
			const userToInsert = users.value[selectedIndex.value];
			if (userToInsert) {
				e.stopPropagation();
				e.preventDefault();
				insertUser(userToInsert);
			}
		}
	}
}

function insertUser(user: UserModel) {
	editorInsertMention(controller, user.username);
	emit('insert');
}
</script>

<template>
	<div ref="container" :style="styles" class="-container">
		<transition name="fade">
			<div v-if="visible" ref="list" class="-autocomplete">
				<AppLoading
					v-if="isLoading && isInverted"
					class="-loading-top"
					centered
					hide-label
				/>

				<template v-if="users.length">
					<button
						v-for="user of displayUsers"
						:key="user.id"
						class="-suggestion"
						:class="{ '-suggestion-selected': isSelected(user.id) }"
						@click.prevent="insertUser(user)"
					>
						<div v-if="user.is_following" class="-follow-indicator">
							<small class="text-muted">
								<AppJolticon icon="user" />
								<div v-if="user.follows_you">
									{{ $gettext(`You follow each other`) }}
								</div>

								<div v-else>
									{{ $gettext(`Following`) }}
								</div>
							</small>
						</div>
						<div class="-user">
							<AppUserAvatarImg class="-avatar" :user="user" />
							<div class="-names">
								<div class="-name-row">
									<strong>{{ user.display_name }}</strong>
									<AppUserVerifiedTick :user="user" />
								</div>
								<div>
									<small>@{{ user.username }}</small>
								</div>
							</div>
						</div>
					</button>
				</template>

				<AppLoading
					v-if="isLoading && !isInverted"
					class="-loading-bottom"
					centered
					hide-label
				/>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 0.1s

.fade-enter-from
.fade-leave-to
	opacity: 0

.-container
	position: absolute
	z-index: $zindex-content-editor
	rounded-corners-lg()
	overflow: hidden
	elevate-2()

.-autocomplete
	change-bg('bg')
	overflow-y: auto
	width: 300px
	max-height: 500px // We don't want this to get out of control

	// On mobile, take up the full width
	@media $media-xs
		width: 100vw

.-suggestion
	padding-bottom: 10px
	padding-top: 10px
	padding-left: 8px
	padding-right: 8px
	cursor: pointer
	transition: background-color 200ms $strong-ease-out
	// Override button styling
	display: block
	width: 100%
	outline: 0
	border: 0
	change-bg('bg')
	text-align: left

	@media $media-xs
		padding-bottom: 6px
		padding-top: 6px

	&:hover
		change-bg('bg-offset')

	&:not(:last-child)
		border-bottom-width: $border-width-small
		border-bottom-style: solid
		theme-prop('border-bottom-color', 'bg-subtle')

.-suggestion-selected
	change-bg('bg-offset')

.-follow-indicator
	margin-left: 24px
	margin-bottom: 4px

	& *
		vertical-align: middle

.-user
	display: flex
	align-items: center
	overflow-x: hidden

.-avatar
	width: 40px
	margin-right: 16px
	flex-shrink: 0

	@media $media-xs
		margin-right: 8px
		width: 24px

.-names
	@media $media-xs
		& > *
			display: inline-block

		& *
			vertical-align: middle

.-name-row
	text-overflow()

	& *
		vertical-align: middle

.-loading-top
	margin-top: 16px

	@media $media-xs
		margin-top: 8px

.-loading-bottom
	margin-top: 16px

	@media $media-xs
		margin-top: 8px
</style>
