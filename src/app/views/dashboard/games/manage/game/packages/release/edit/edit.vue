<template>
	<div v-if="isRouteBootstrapped">
		<nav class="breadcrumb">
			<ul>
				<li>
					<router-link :to="{ name: 'dash.games.manage.game.packages.list' }">
						<span class="breadcrumb-tag"><nbsp /></span>
						<translate>Packages</translate>
					</router-link>
					<span class="breadcrumb-separator"><app-jolticon icon="chevron-right" /></span>
				</li>
				<li>
					<router-link
						:to="{
							name: 'dash.games.manage.game.packages.edit',
							params: {
								packageId: package.id,
							},
						}"
					>
						<span class="breadcrumb-tag">
							<translate>dash.games.releases.manage.breadcrumb_package</translate>
						</span>
						{{ package.title || game.title }}
					</router-link>
					<span class="breadcrumb-separator"><app-jolticon icon="chevron-right" /></span>
				</li>
				<li>
					<span class="active">
						<span class="breadcrumb-tag">
							<translate>dash.games.releases.manage.breadcrumb_release</translate>
						</span>
						{{ release.version_number }}
					</span>
				</li>
			</ul>
		</nav>

		<hr />

		<div class="row">
			<div class="col-lg-9">
				<form-game-release
					:model="release"
					:game="game"
					:package="package"
					:builds="builds"
					:launch-options="launchOptions"
					:build-download-counts="buildDownloadCounts"
					:are-builds-locked-by-jam="areBuildsLockedByJam"
					:are-web-builds-locked-by-sellable="areWebBuildsLockedBySellable"
					@submit="onSaved"
					@remove-release="removeRelease"
					@unpublish-release="unpublishRelease"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./edit" />
