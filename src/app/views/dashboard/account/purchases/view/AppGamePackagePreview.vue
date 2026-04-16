<script lang="ts" setup>
import { GameModel } from '~common/game/game.model';
import { GamePackageModel } from '~common/game/package/package.model';
import AppGameThumbnailImg from '~common/game/thumbnail/AppGameThumbnailImg.vue';

type Props = {
	gamePackage: GamePackageModel;
	game: GameModel;
};
const { gamePackage, game } = defineProps<Props>();
</script>

<template>
	<div class="row">
		<div class="col-xs-2">
			<RouterLink style="display: block" :to="game.routeLocation">
				<AppGameThumbnailImg animate :game="game" />
			</RouterLink>
		</div>
		<div class="col-xs-10">
			<p>
				<RouterLink :to="game.routeLocation">
					{{ game.title }}
				</RouterLink>
				<br />
				<span class="small">
					{{ $gettext(`by`) }}
					{{ ' ' }}
					<RouterLink :to="game.developer.routeLocation">
						{{ game.developer.display_name }}
					</RouterLink>
				</span>
			</p>

			<p />

			<h5 class="sans-margin">
				{{ $gettext(`Packages`) }}
			</h5>

			<div class="small text-muted">- {{ gamePackage.title || game.title }}</div>
		</div>
	</div>
</template>
