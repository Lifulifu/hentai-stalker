<script lang="ts">
  import { Avatar, Drawer, drawerStore } from "@skeletonlabs/skeleton";
  import type { DrawerSettings } from "@skeletonlabs/skeleton";
  import { SvelteComponent, onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { v4 as uuidv4 } from "uuid";
  import type { UserData } from "./types";

  const authUrl = "/api/hentai-stalker/auth/google";
  let newKeyWord: string = "";
  let userData: UserData = null;

  async function onSubmit() {}

  async function logout() {
    await fetch("/api/hentai-stalker/auth/google/logout");
    userData = null;
  }

  onMount(async () => {
    try {
      const data = await fetch("/api/hentai-stalker/user");
      if (data.ok) userData = await data.json();
    } catch (e) {
      console.error("Cannot fetch user data");
    }
  });
</script>

<main class="h-full lg:grid lg:grid-cols-[20rem_1fr]">
  <section
    class="border-r border-surface-300 h-full grid grid-rows-[auto_1fr_auto]"
  >
    <div class="border-b border-surface-300 pl-4 pr-2 py-2 flex items-center">
      {#if !userData}
        <Avatar initials="?" class="w-10 mr-4" />
        <a class="button google" href={authUrl}>
          <button class="btn variant-outline-primary px-4 py-2">
            Sign in with Google
          </button>
        </a>
      {:else}
        <Avatar src={userData.pictureUrl} class="w-10 mr-4" />
        <div class="flex-grow flex-shrink">
          <h1 class="text-lg">{userData.name}</h1>
          <h2 class="text-sm text-surface-500">{userData.email}</h2>
        </div>
        <button class="btn-icon variant-soft-surfacee" on:click={logout}>
          <Icon icon="material-symbols:logout" height="1.5rem" />
        </button>
      {/if}
    </div>
    <div class="px-4 py-4">
      <form
        class="input-group input-group-divider grid-cols-[1fr_auto]"
        on:submit|preventDefault={onSubmit}
      >
        <input
          class="input rounded-md px-4 py-2 outline-none"
          type="text"
          placeholder="Input"
          bind:value={newKeyWord}
        />
        <button type="submit" class="variant-filled-primary">
          <Icon icon="material-symbols:add" height="2rem" />
        </button>
      </form>
    </div>
  </section>

  <section>galleries</section>
</main>
