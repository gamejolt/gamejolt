<template>
	<div>
		<app-invalid-key v-if="invalidKey" />

		<section class="container" v-else>
			<h1 class="section-header">
				<translate v-if="!resourceTitle">
					Retrieve Your Keys
				</translate>
				<translate v-else :translate-params="{ resource: resourceTitle }">
					Retrieve Your Keys for %{ resource }
				</translate>
			</h1>

			<p>
				<template v-if="!resourceTitle">
					<translate>Please enter your email address to retrieve your keys.</translate>
				</template>
				<template v-if="resourceTitle">
					<span v-translate="{ resource: resourceTitle }">
						Please enter your email address to retrieve your keys for
						<b>%{ resource }</b>
						.
					</span>
				</template>
				<translate>We will email you a link to your download(s).</translate>
			</p>

			<form-retrieve :key-id="key" :bundle="bundle" :game="game" @submit="onSubmit" />
		</section>
	</div>
</template>

<script lang="ts" src="./retrieve"></script>
