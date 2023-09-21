<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Avatar } from "@skeletonlabs/skeleton";
  import Icon from "@iconify/svelte";
  const dispatch = createEventDispatcher();

  export let userData;
  const authUrl = "/api/hentai-stalker/auth/google";

  async function logout() {
    try {
      await fetch("/api/hentai-stalker/auth/google/logout");
      dispatch("logout", { error: null });
    } catch (err) {
      dispatch("logout", { error: err });
    }
  }
</script>

<section class="grid grid-rows-[auto_1fr_auto]">
  {#if !userData}
    <div
      class="border-b border-surface-300 px-4 py-2 grid grid-cols-[auto_1fr] items-center"
    >
      <Avatar initials="?" class="w-10 mr-4" />
      <a class="button google" href={authUrl}>
        <button class="btn variant-outline-primary px-4 py-2">
          Sign in with Google
        </button>
      </a>
    </div>
  {:else}
    <div
      class="border-b border-surface-300 px-4 py-2 grid grid-cols-[auto_1fr_auto] items-center"
    >
      <Avatar src={userData.pictureUrl} class="w-10 mr-4" />
      <div class="flex-grow flex-shrink overflow-hidden">
        <h1 class="text-lg">{userData.name}</h1>
        <h2 class="text-sm text-surface-500">{userData.email}</h2>
      </div>
      <button class="btn-icon variant-soft-surface" on:click={logout}>
        <Icon icon="material-symbols:logout" height="1.5rem" />
      </button>
    </div>
  {/if}
</section>
