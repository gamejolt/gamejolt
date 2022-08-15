import { inject, InjectionKey, ref } from 'vue';
import { Game } from '../../_common/game/game.model';
import { MediaItem } from '../../_common/media-item/media-item-model';
import { User } from '../../_common/user/user.model';

export const AuthStoreKey: InjectionKey<AuthStore> = Symbol('auth-store');

export type AuthStore = ReturnType<typeof createAuthStore>;

export function useAuthStore() {
	return inject(AuthStoreKey)!;
}

export function createAuthStore() {
	const shouldShowCoverImage = ref(true);
	const coverMediaItem = ref<MediaItem>();
	const coverGame = ref<Game>();
	const inviteUser = ref<User>();

	function bootstrap(payload: any) {
		coverMediaItem.value = payload.mediaItem && new MediaItem(payload.mediaItem);
		coverGame.value = payload.game && new Game(payload.game);
		inviteUser.value = payload.inviteUser && new User(payload.inviteUser);
	}

	function showCoverImage() {
		shouldShowCoverImage.value = true;
	}

	function hideCoverImage() {
		shouldShowCoverImage.value = false;
	}

	return {
		shouldShowCoverImage,
		coverMediaItem,
		coverGame,
		inviteUser,

		bootstrap,
		showCoverImage,
		hideCoverImage,
	};
}

export const authStore = createAuthStore();
