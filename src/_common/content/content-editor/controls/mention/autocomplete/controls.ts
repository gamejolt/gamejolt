import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Api } from '../../../../../api/api.service';
import AppLoading from '../../../../../loading/loading.vue';
import { Screen } from '../../../../../screen/screen-service';
import AppUserAvatarImg from '../../../../../user/user-avatar/img/img.vue';
import { User } from '../../../../../user/user.model';
import AppUserVerifiedTick from '../../../../../user/verified-tick/verified-tick.vue';
import { ContentEditorService } from '../../../content-editor.service';
import { BasicMentionRegex } from '../../../plugins/input-rules/detect-mention-suggestion';
import { ContentEditorSchema } from '../../../schemas/content-editor-schema';
import ContentEditorMentionCache from '../cache.service';

@Component({
	components: {
		AppLoading,
		AppUserAvatarImg,
		AppUserVerifiedTick,
	},
})
export default class AppContentEditorControlsMentionAutocompleteControls extends Vue {
	@Prop(Object)
	view!: EditorView<ContentEditorSchema>;
	@Prop(Number)
	stateCounter!: number;
	@Prop(Number)
	canShow!: number;

	visible = false;
	top = 'auto';
	bottom = 'auto';
	left = 'auto';

	query = ''; // Currently active suggestion query
	selectedIndex = 0;
	isListening = false; // If we are listening to the document keydown event, to be able to unbind it later.
	isInverted = false; // If the list is inverted due to screen size constraints. It shows above the control instead if below.
	remoteSuggestionDebounceTimeout: NodeJS.Timer | null = null; // Timeout between requests to search backend
	isLoading = false; // Loading more users from backend
	users: User[] = [];

	readonly Screen = Screen;

	$refs!: {
		container: HTMLElement;
		list: HTMLDivElement;
	};

	get displayUsers() {
		if (this.isInverted) {
			return this.users.slice().reverse();
		}
		return this.users;
	}

	get showControl() {
		return this.visible && (this.isLoading || this.users.length > 0);
	}

	mounted() {
		this.update();
		document.addEventListener('keydown', this.onKeyDown);
		this.isListening = true;
	}

	destroyed() {
		if (this.isListening) {
			document.removeEventListener('keydown', this.onKeyDown);
			this.isListening = false;
		}

		if (this.remoteSuggestionDebounceTimeout) {
			clearTimeout(this.remoteSuggestionDebounceTimeout);
			this.remoteSuggestionDebounceTimeout = null;
		}
	}

	@Watch('canShow')
	@Watch('stateCounter')
	private update() {
		if (this.canShow && this.view instanceof EditorView) {
			const state = this.view.state;
			const node = ContentEditorService.getSelectedNode(this.view.state);

			if (node !== null && node.isText) {
				// Get all text from the beginning of the doc to the end of the selection.
				// Then from the end of that slice, get the mention text.
				const slice = state.doc.slice(0, state.selection.from);
				const text = ContentEditorService.getFragmentText(slice.content);
				const matches = BasicMentionRegex.exec(text);

				if (matches && matches.length >= 2) {
					const start = this.view.coordsAtPos(state.selection.from);

					const box = this.$refs.container.offsetParent.getBoundingClientRect();
					// If the text control is more than 50% down the page, open the control above ("inverted")
					const relativeYPos = box.top / Screen.height;
					if (relativeYPos >= 0.5) {
						this.isInverted = true;
						this.top = 'auto';
						this.bottom = start.top - box.top + 30 + 'px';
					} else {
						this.isInverted = false;
						this.top = start.top - box.top + 30 + 'px';
						this.bottom = 'auto';
					}

					if (this.Screen.isXs) {
						// On mobile, we want to position the element to the left border of the screen
						this.left = '-' + box.left + 'px';
					} else {
						this.left = 'auto';
					}

					this.query = matches[1];
					this.updateSuggestions(this.query);
					this.visible = true;

					return;
				}
			}
		}

		this.visible = false;
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
		if (this.isInverted) {
			await this.$nextTick(); // Need to wait here for the list to get bootstrapped before scrolling it.
			this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
		}
	}

	isSelected(userId: number) {
		return this.users[this.selectedIndex].id === userId;
	}

	async onKeyDown(e: KeyboardEvent) {
		if (this.visible) {
			if (e.key === 'ArrowDown' && this.selectedIndex < this.users.length - 1) {
				this.selectedIndex++;
				e.stopPropagation();
				e.preventDefault();
			} else if (e.key === 'ArrowUp' && this.selectedIndex > 0) {
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

	onClickInsert(user: User) {
		this.insertUser(user);
	}

	insertUser(user: User) {
		if (this.visible && this.canShow) {
			// start - end include the @query text, it gets replaced with the insertText call.
			const start = this.view.state.selection.from - this.query.length - 1;
			const end = this.view.state.selection.from;

			const tr = this.view.state.tr;
			tr.insertText('@' + user.username + ' ', start, end); // Add space to the end.
			this.view.dispatch(tr);

			this.$emit('insert', user);
		}
	}
}
