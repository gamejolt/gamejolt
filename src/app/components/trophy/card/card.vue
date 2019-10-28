<template>
	<div class="-container">
		<div
			class="-trophy-card sheet sheet-no-full-bleed"
			:class="{ '-trophy-new': isNew }"
			@click="onClick"
		>
			<div class="-background">
				<div class="-bg" :class="bgClass"></div>
				<div class="-bg-gradient"></div>
			</div>
			<div class="-content">
				<strong class="-title" :title="trophy.title">{{ trophy.title }}</strong>
				<div class="-subline">
					<small class="text-muted">
						<span v-if="isGame" class="-game-title">
							<app-jolticon icon="game" />
							<span>
								{{ gameTitle }}
							</span>
						</span>
						<template v-else>
							<app-jolticon icon="gamejolt" />
							<span>
								<translate>Game Jolt Trophy</translate>
							</span>
						</template>
					</small>
				</div>
				<div class="-thumbnail">
					<app-trophy-thumbnail :trophy="trophy" no-tooltip />
				</div>
				<div class="-description">
					<app-fade-collapse :collapse-height="64">
						<small class="text-muted">{{ trophy.description }}</small>
					</app-fade-collapse>
				</div>
			</div>
		</div>
		<div v-if="isNew" class="-new-notice">
			<app-jolticon icon="exclamation-circle" notice big />
		</div>
	</div>
</template>

<style lang="stylus" src="./card.styl" scoped></style>

<script lang="ts" src="./card"></script>
