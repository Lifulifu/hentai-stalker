<script lang="ts">
  import { Avatar, Drawer, drawerStore } from "@skeletonlabs/skeleton";
  import type { DrawerSettings } from "@skeletonlabs/skeleton";
  import { SvelteComponent, onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { v4 as uuidv4 } from "uuid";
  import type { KeywordItem, UserData } from "./types";

  const authUrl = "/api/hentai-stalker/auth/google";
  let userData: UserData = null;
  let keywordInputDisabled = false;
  let newKeyWord: string = "";
  let keywords: KeywordItem[] = [];

  async function fetchKeywords(): Promise<KeywordItem[]> {
    try {
      let res: any = await fetch("/api/hentai-stalker/keywords");
      res = await res.json();
      console.log(res);
      return res.value;
    } catch (e) {
      console.error("Cannot fetch keywords", e);
      return [];
    }
  }

  async function addNewKeyword(keyword: string) {
    keywordInputDisabled = true;
    try {
      await fetch("/api/hentai-stalker/keywords/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywordId: uuidv4(),
          keyword: keyword,
        }),
      });
      newKeyWord = "";
      keywords = await fetchKeywords();
    } catch (e) {
      console.error("Cannot add new keyword", e);
    }
    keywordInputDisabled = false;
  }

  async function logout() {
    await fetch("/api/hentai-stalker/auth/google/logout");
    userData = null;
    keywords = [];
  }

  onMount(async () => {
    try {
      const data = await fetch("/api/hentai-stalker/user");
      if (!data.ok) throw new Error();
      userData = await data.json();
      keywords = await fetchKeywords();
    } catch (e) {
      console.error("Cannot fetch user data", e);
    }
  });
</script>

<main class="h-full lg:grid lg:grid-cols-[20rem_1fr]">
  <div class="grid grid-rows-[auto_1fr] border-r border-surface-300 h-full">
    <!-- user -->
    <section class="grid grid-rows-[auto_1fr_auto]">
      {#if !userData}
        <div
          class="border-b border-surface-300 pl-4 pr-2 py-2 grid grid-cols-[auto_1fr] items-center"
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
          class="border-b border-surface-300 pl-4 pr-2 py-2 grid grid-cols-[auto_1fr_auto] items-center"
        >
          <Avatar src={userData.pictureUrl} class="w-10 mr-4" />
          <div class="flex-grow flex-shrink overflow-hidden">
            <h1 class="text-lg">{userData.name}</h1>
            <h2 class="text-sm text-surface-500">{userData.email}</h2>
          </div>
          <button class="btn-icon variant-soft-surfacee" on:click={logout}>
            <Icon icon="material-symbols:logout" height="1.5rem" />
          </button>
        </div>
      {/if}
      <div class="px-4 py-4">
        <form
          class="input-group input-group-divider grid grid-cols-[1fr_auto]"
          on:submit|preventDefault={() => addNewKeyword(newKeyWord)}
        >
          <input
            class="input rounded-md px-4 py-2 outline-none"
            type="text"
            placeholder="Add a keyword..."
            disabled={keywordInputDisabled}
            bind:value={newKeyWord}
          />
          <button type="submit" class="variant-filled-primary">
            <Icon icon="material-symbols:add" height="2rem" />
          </button>
        </form>
      </div>
    </section>

    <!-- keywords -->
    <section>
      <ol class="list">
        {#each keywords as keywordItem}
          <li>
            <button
              class="w-full px-4 py-2 text-left hover:bg-primary-500 hover:text-white grid grid-cols-[2rem_1fr_auto] items-center"
            >
              <span class="">💀</span>
              <span class="overflow-hidden">{keywordItem.keyword}</span>
              <span class="flex gap-1 text-surface-500">
                <Icon icon="material-symbols:filter-alt" height="1.3rem" />
                <Icon icon="material-symbols:close-rounded" height="1.3rem" />
              </span>
            </button>
          </li>
        {/each}
      </ol>
    </section>
  </div>

  <section>galleries</section>
</main>
