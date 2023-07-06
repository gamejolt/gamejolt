<script lang="ts">
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../../../api/api.service';
import AppLoading from '../../../../loading/AppLoading.vue';
import { Screen } from '../../../../screen/screen-service';
import AppUserVerifiedTick from '../../../../user/AppUserVerifiedTick.vue';
import AppUserAvatarImg from '../../../../user/user-avatar/AppUserAvatarImg.vue';
import { User } from '../../../../user/user.model';
import { editorInsertMention, useContentEditorController } from '../../content-editor-controller';
import ContentEditorMentionCache from './cache.service';

@Options({
	components: {
		AppLoading,
		AppUserAvatarImg,
		AppUserVerifiedTick,
	},
})
export default class AppContentEditorControlsMentionAutocomplete extends Vue {
	@Prop({ type: Boolean, required: true })
	canShow!: boolean;

	controller = setup(() => useContentEditorController()!);

	query = ''; // Currently active suggestion query
	selectedIndex = 0;
	isListening = false; // If we are listening to the document keydown event, to be able to unbind it later.
	remoteSuggestionDebounceTimeout: NodeJS.Timer | null = null; // Timeout between requests to search backend
	isLoading = false; // Loading more users from backend
	users: User[] = [];

	readonly Screen = Screen;

	@Emit('insert') emitInsert() {}
	@Emit('user-change') emitUserChange(_count: number) {}

	declare $refs: {
		container: HTMLElement;
		list: HTMLDivElement;
	};

	get view() {
		return this.controller.view;
	}

	get displayUsers() {
		if (this.isInverted) {
			return this.users.slice().reverse();
		}
		return this.users;
	}

	get showControl() {
		return this.visible && (this.isLoading || this.users.length > 0);
	}

	get visible() {
		return this.controller.capabilities.hasMentionControls && this.canShow;
	}

	get isInverted() {
		// If the text control is more than 50% down the page, open the control
		// above ("inverted")
		return (this.controller.window.top ?? 0) / Screen.height >= 0.5;
	}

	get styling() {
		const {
			relativeCursorTop,
			window: { left },
		} = this.controller;
		const offset = relativeCursorTop + 30 + 'px';

		return {
			top: this.isInverted ? 'auto' : offset,
			bottom: this.isInverted ? offset : 'auto',
			left: this.Screen.isXs ? `-${left}px` : 'auto',
			visibility: this.showControl ? 'visible' : 'hidden',
		};
	}

	get mention() {
		return this.controller.capabilities.mention;
	}

	mounted() {
		this.onMentionChange();
		document.addEventListener('keydown', this.onKeyDown);
		this.isListening = true;
	}

	unmounted() {
		if (this.isListening) {
			document.removeEventListener('keydown', this.onKeyDown);
			this.isListening = false;
		}

		if (this.remoteSuggestionDebounceTimeout) {
			clearTimeout(this.remoteSuggestionDebounceTimeout);
			this.remoteSuggestionDebounceTimeout = null;
		}
	}

	@Watch('mention')
	private onMentionChange() {
		if (!this.visible) {
			this.emitUserChange(0);
			return;
		}

		this.query = this.mention;
		this.updateSuggestions(this.query);
	}

	@Watch('users.length')
	onUsersLengthChange() {
		this.emitUserChange(this.users.length);
	}

	private async updateSuggestions(query: string) {
		// Stop any existing queued search timeout.
		if (this.remoteSuggestionDebounceTimeout) {
			clearTimeout(this.remoteSuggestionDebounceTimeout);
			this.remoteSuggestionDebounceTimeout = null;
			this.isLoading = false;
		}

		this.selectedIndex = 0;
		// If we already have the search results cached, use those and don't query backend.
		if (ContentEditorMentionCache.hasResults(query)) {
			this.users = ContentEditorMentionCache.getResults(query);
			await this.handleInverted();
		} else {
			this.users = [];

			// We set a timeout here to not send right away when the user is typing fast.
			this.remoteSuggestionDebounceTimeout = setTimeout(async () => {
				this.isLoading = true;

				const payload = await Api.sendRequest(
					'/web/search/mention-suggestions?q=' + encodeURIComponent(query),
					undefined,
					{ detach: true }
				);

				if (payload.users) {
					const searchUsers = User.populate(payload.users);

					// Add to cache
					ContentEditorMentionCache.setResults(query, searchUsers);

					// Only process results if the currently active suggestion is still the one we initiated the search with.
					if (query === this.query) {
						this.users = searchUsers;
						await this.handleInverted();
					}
				}

				this.isLoading = false;
			}, 500);
		}
	}

	private async handleInverted() {
		// If we are inverted, scroll the container down.
		if (this.isInverted && this.$refs.list) {
			// Need to wait here for the list to get bootstrapped before scrolling it.
			await nextTick();
			this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
		}
	}

	isSelected(userId: number) {
		return this.users[this.selectedIndex].id === userId;
	}

	async onKeyDown(e: KeyboardEvent) {
		if (this.visible && this.users.length > 0) {
			let direction = '';
			if (e.key === 'ArrowDown') {
				direction = this.isInverted ? 'up' : 'down';
			} else if (e.key === 'ArrowUp') {
				direction = this.isInverted ? 'down' : 'up';
			}

			if (direction === 'down' && this.selectedIndex < this.users.length - 1) {
				this.selectedIndex++;
				e.stopPropagation();
				e.preventDefault();
			} else if (direction === 'up' && this.selectedIndex > 0) {
				this.selectedIndex--;
				e.stopPropagation();
				e.preventDefault();
			} else if (e.key === 'Enter' || e.key === 'Tab') {
				const userToInsert = this.users[this.selectedIndex];
				if (userToInsert) {
					e.stopPropagation();
					e.preventDefault();
					this.insertUser(userToInsert);
				}
			}
		}
	}

	insertUser(user: User) {
		editorInsertMention(this.controller, user.username);
		this.emitInsert();
	}
}
</script>

<template>
	<div ref="container" :style="styling" class="-container">
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
								<AppTranslate v-if="user.follows_you">
									You follow each other
								</AppTranslate>
								<AppTranslate v-else>Following</AppTranslate>
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

	&*
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
