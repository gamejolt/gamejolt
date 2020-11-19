<script lang="ts" src="./collection-list"></script>

<template>
	<ul class="shell-nav">
		<li
			v-for="collection of filtered"
			v-show="!filter || filterComparator(collection)"
			:key="collection._id"
			class="offline-disable"
		>
			<router-link
				v-app-track-event="`sidebar:collection:playlist`"
				:to="collection.routeLocation"
				active-class="active"
				:title="collection.getTitle()"
			>
				<span class="shell-nav-icon">
					<app-jolticon icon="playlist" />
				</span>

				<span
					v-if="collection.owner && collection.type === 'developer'"
					class="shell-nav-label"
				>
					@{{ collection.owner.username }}
				</span>

				<span v-else class="shell-nav-label">
					{{ collection.name }}

					<small v-if="collection.owner && collection.from_subscription">
						<translate>library.by</translate>
						@{{ collection.owner.username }}
					</small>
				</span>
			</router-link>
		</li>
	</ul>
</template>
