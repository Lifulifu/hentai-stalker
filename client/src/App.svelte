<script lang="ts">
  import type { DrawerSettings } from "@skeletonlabs/skeleton";
  import { SvelteComponent, onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { v4 as uuidv4 } from "uuid";
  import type { KeywordItem, UserData } from "./types";
  import UserSection from "./lib/UserSection.svelte";

  let userData: UserData = null;
  let keywordInputDisabled = false;
  let newKeyWord: string = "";
  let keywords: KeywordItem[] = [];

  let showSidePanel: boolean = false;
  $: mainSectionStyle = showSidePanel
    ? "h-full lg:grid lg:grid-cols-[20rem_1fr]"
    : "h-full";
  $: sidePanelDisplayStyle = showSidePanel ? "grid" : "hidden";

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

  function onLogout(e) {
    if (e.detail.error) return;
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
      console.log("Cannot fetch user data", e);
    }
  });
</script>

<main class={mainSectionStyle}>
  <!-- Side panel section -->
  <div
    class="{sidePanelDisplayStyle} grid-rows-[auto_auto_1fr] border-r border-surface-300 h-full"
  >
    <!-- close button -->
    <section class="border-b border-surface-300 pl-4 pr-2 py-2">
      <button
        class="btn-icon variant-soft-surface"
        on:click={() => {
          showSidePanel = false;
        }}
      >
        <Icon icon="material-symbols:close" height="1.5rem" />
      </button>
    </section>
    <UserSection {userData} on:logout={onLogout} />
    <section>
      <!-- keyword input -->
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

      <!-- keywords -->
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

  <!-- gallery section -->
  <section>
    <section class="px-4 py-2 flex items-center">
      {#if !showSidePanel}
        <button
          class="btn-icon variant-soft-surface mr-2"
          on:click={() => {
            showSidePanel = true;
          }}
        >
          <Icon icon="material-symbols:menu" height="1.5rem" />
        </button>
        <h1>Hentai-Stalker</h1>
      {/if}
    </section>
    galleries
  </section>
</main>
