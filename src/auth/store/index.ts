import { inject, InjectionKey, ref } from 'vue';
import { GameModel } from '../../_common/game/game.model';
import { MediaItemModel } from '../../_common/media-item/media-item-model';
import { UserModel } from '../../_common/user/user.model';

export const AuthStoreKey: InjectionKey<AuthStore> = Symbol('auth-store');

export type AuthStore = ReturnType<typeof createAuthStore>;

export function useAuthStore() {
	return inject(AuthStoreKey)!;
}

export function createAuthStore() {
	const shouldShowCoverImage = ref(true);
	const coverMediaItem = ref<MediaItemModel>();
	const coverGame = ref<GameModel>();
	const inviteUser = ref<UserModel>();

	function bootstrap(payload: any) {
		coverMediaItem.value = payload.mediaItem && new MediaItemModel(payload.mediaItem);
		coverGame.value = payload.game && new GameModel(payload.game);
		inviteUser.value = payload.inviteUser && new UserModel(payload.inviteUser);
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
