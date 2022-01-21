<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../_common/game/thumbnail/AppGameThumbnail.vue';
import { useCommonStore } from '../../../../_common/store/common-store';

@Options({
	components: {
		AppGameThumbnail,
	},
})
export default class AppKeyBundle extends Vue {
	@Prop({ type: Object, required: true })
	payload!: any;

	@Prop({ type: String, required: true })
	loginUrl!: string;

	@Prop(String)
	accessKey?: string;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	bundle: GameBundle = null as any;
	games: Game[] = [];

	@Emit('claim')
	emitClaim(_bundle: GameBundle) {}

	created() {
		this.bundle = new GameBundle(this.payload.bundle);
		this.games = Game.populate(this.payload.games);
	}

	claim() {
		this.emitClaim(this.bundle);
	}
}
</script>

<template>
	<div>
		<div v-if="!app.user" class="alert full-bleed full-bleed-xs text-center">
			<p>
				<a :href="loginUrl">
					<translate>
						Sign in to Game Jolt to be able to claim this bundle into your Library.
					</translate>
				</a>
			</p>
		</div>

		<p v-if="app.user">
			<app-button primary block @click="claim()">
				<translate>Claim Bundle into Library</translate>
			</app-button>
		</p>

		<h1 class="section-header">{{ bundle.title }}</h1>
		<p>{{ bundle.description }}</p>

		<h3>
			<translate>Games in Bundle</translate>
		</h3>

		<div class="row">
			<div v-for="game of games" :key="game.id" class="col-sm-6">
				<app-game-thumbnail
					:game="game"
					:link-to="
						$router.resolve({
							name: 'key',
							params: { accessKey: accessKey },
							query: { bundleGameId: game.id },
						}).href
					"
					hide-pricing
				/>
			</div>
		</div>
	</div>
</template>
