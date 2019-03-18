<template>
	<app-theme :theme="theme">
		<section
			class="-banner section landing-header"
			:style="{
				'background-image': `url('${item.back_url}')`,
			}"
		>
			<router-link
				v-if="location"
				class="-click"
				:to="location"
				v-app-track-event="`home:banner:${item.id}`"
			/>

			<div class="container">
				<div class="-main">
					<div v-if="item.front_url" class="-logo">
						<img
							class="img-responsive"
							style="display: inline-block"
							:src="item.front_url"
							alt=""
						/>
					</div>

					<div
						class="-info"
						:class="{
							'-info-full': !item.front_url,
						}"
					>
						<p class="lead">
							{{ item.content }}
						</p>

						<div class="-controls">
							<div v-if="item.game">
								<app-button
									v-if="!item.custom_url"
									solid
									:to="location"
									v-app-track-event="`home:banner:${item.game.id}`"
								>
									<translate>View Game</translate>
								</app-button>
								<app-button
									v-else-if="item.custom_url"
									solid
									:href="item.custom_url"
									target="_blank"
									v-app-track-event="`home:banner:custom-${item.game.id}`"
								>
									{{ item.custom_text }}
								</app-button>

								<app-game-follow-widget
									v-if="shouldShowFollow"
									:game="item.game"
									solid
									primary
									v-app-track-event="`home:banner:follow-${item.game.id}`"
								/>
							</div>
							<div v-else-if="item.jam">
								<app-button
									primary
									solid
									:to="location"
									v-app-track-event="`home:banner:${item.jam.id}`"
								>
									<translate>View Games</translate>
								</app-button>
								<app-button
									solid
									:href="item.jam.fullUrl"
									target="_blank"
									v-app-track-event="`home:banne:jam-${item.jam.id}`"
								>
									<translate>View Jam Page</translate>
								</app-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</app-theme>
</template>

<style src="./banner.styl" scoped />

<script lang="ts" src="./banner" />
