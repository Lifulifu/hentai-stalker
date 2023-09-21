<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { v4 as uuidv4 } from "uuid";
  import type { KeywordItem, UserData } from "./types";
  import UserSection from "./lib/UserSection.svelte";
  import Gallery from "./lib/Gallery.svelte";
  import {formatDistanceToNow} from "date-fns"
  import {parseDate} from "./lib/util"

  let userData: UserData = null;
  let keywordInputDisabled = false;
  let newKeyWord: string = "";
  let keywords: KeywordItem[] = [];
  let galleriesData: any[] = [];

  let showSidePanel: boolean = true;
  $: mainSectionStyle = showSidePanel
    ? "h-full lg:grid lg:grid-cols-[20rem_1fr]"
    : "h-full";
  $: sidePanelDisplayStyle = showSidePanel ? "grid" : "hidden";
  $: galleriesSectionDisplayStyle = showSidePanel ? "hidden lg:grid" : "grid";

  let lastUpdateTimeAgo = '-';
  $: if (galleriesData?.length > 0) {
    lastUpdateTimeAgo = formatDistanceToNow(parseDate(galleriesData[0].addedTime));
  }
  let isScraping = false;

  async function fetchKeywords(): Promise<KeywordItem[]> {
    try {
      let res: any = await fetch("/api/hentai-stalker/keywords");
      res = await res.json();
      // new to old
      return res.value.sort(
        (a, b) => Date.parse(b.addedTime) - Date.parse(a.addedTime)
      );
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
      // update modified keywords
      keywords = await fetchKeywords();
    } catch (e) {
      console.error("Cannot add new keyword", e);
    }
    keywordInputDisabled = false;
  }

  async function removeKeyword(keyword: string, keywordId: string) {
    console.log("remove");
    keywordInputDisabled = true;
    try {
      await fetch("/api/hentai-stalker/keywords/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywordId: keywordId,
          keyword: keyword,
        }),
      });
      // update modified keywords
      keywords = await fetchKeywords();
    } catch (e) {
      console.error("Cannot remove keyword", e);
    }
    keywordInputDisabled = false;
  }

  async function fetchGalleriesData() {
    try {
      let res: any = await fetch("/api/hentai-stalker/galleries");
      res = await res.json();
      // new to old
      console.dir(res);
      return res.value.sort(
        (a, b) => Date.parse(b.postedTime) - Date.parse(a.postedTime)
      );
    } catch (e) {
      console.error("Cannot fetch keywords", e);
      return [];
    }
  }

  async function doScrape() {
    isScraping = true;
    await fetch("/api/hentai-stalker/scrape");
    isScraping = false;
    init();
  }

  function onLogout(e) {
    if (e.detail.error) return;
    userData = null;
    keywords = [];
  }

  async function init() {
    try {
      const data = await fetch("/api/hentai-stalker/user");
      if (!data.ok) throw new Error();
      userData = await data.json();
    } catch (e) {
      console.log("Failed to fetch user data", e);
      // If userData can't be fetched, don't fetch further data
      return;
    }
    console.log('fetching keywords...')
    // these can execute in parallel
    fetchKeywords()
      .then((res) => (keywords = res))
      .catch((e) => console.error("Failed to fetch keywords.", e));
    console.log('fetching galleries...')
    fetchGalleriesData()
      .then((res) => (galleriesData = res.slice(0, 80)))
      .catch((e) => console.error("Failed to fetch galleries.", e));
  }

  onMount(async () => {
    await init();
  });

</script>

<main class={mainSectionStyle}>
  <!-- Side panel section -->
  <div
    class="{sidePanelDisplayStyle} grid-rows-[auto_auto_1fr] border-r border-surface-300 bg-surface-50 h-full"
  >
    <!-- close button -->
    <section
      class="sticky top-0 border-b border-surface-300 pl-4 pr-2 py-2 bg-surface-50 z-50"
    >
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
    <section class="grid grid-rows-[auto_1fr]">
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
      <ol class="list overflow-y-auto">
        {#each keywords as keywordItem}
          <li>
            <button
              class="w-full px-4 py-2 text-left hover:bg-primary-500 hover:text-white grid grid-cols-[1fr_auto] items-center"
            >
              <span class="overflow-x-hidden whitespace-nowrap" >{keywordItem.keyword}</span >
              <button
                class="text-surface-500"
                on:click={() => removeKeyword(keywordItem.keyword, keywordItem.keywordId)}
              >
                <Icon icon="material-symbols:close-rounded"/>
              </button>
            </button>
          </li>
        {/each}
      </ol>
    </section>
  </div>

  <!-- gallery section -->
  <section class="{galleriesSectionDisplayStyle} h-full grid-rows-[auto_auto_1fr]">
    <!-- logo and menu button -->
    <section class="px-4 py-4 flex items-center">
      {#if !showSidePanel}
        <button
          class="btn-icon variant-soft-surface mr-2"
          on:click={() => {
            showSidePanel = true;
          }}
        >
          <Icon icon="material-symbols:menu" height="1.5rem" />
        </button>
      {/if}
      <div class="flex flex-grow items-center justify-center gap-2">
        <h1 class="text-2xl font-bold font-mono"> <span class="text-primary-500">H</span>entai <span class="text-primary-500">S</span>talker </h1>
      </div>
    </section>

    <!-- galleries title and refresh button -->
    <section class="px-4 py-2 flex items-center gap-2 bg-surface-200">
      <Icon icon="material-symbols:book-outline" class="text-primary-500" height="1.5rem"/>
      <h2 class="text-xl font-bold">Gallery</h2>

      <span class="ml-auto text-surface-500">
        {#if isScraping}
          Scraping...
        {:else}
          Last update: {lastUpdateTimeAgo}
        {/if}
      </span>
      <button disabled={isScraping} class="btn-icon variant-soft-surface" on:click={doScrape}>
        <Icon icon="material-symbols:refresh" class="{isScraping ? 'animate-spin' : ''}" height="1.5rem"/>
      </button>
    </section>

    <!-- gallery -->
    <section
      class="grid grid-cols-2 items-start lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2 px-4 py-2 bg-surface-200"
    >
      {#each galleriesData as galleryData}
        <Gallery data={galleryData} />
      {/each}
    </section>
  </section>
</main>
