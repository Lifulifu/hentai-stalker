<script lang="ts">
  import { Modal, modalStore } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import GoogleAuth from "./lib/GoogleAuth.svelte";
  import Icon from "@iconify/svelte";
  import { v4 as uuidv4 } from "uuid";

  let newKeyWord: string = "";
  let userData: any = null;
  let userToken: string = null;

  function onLoginSuccess(e: CustomEvent) {
    userData = e.detail.user;
    userToken = e.detail.token;
    localStorage.setItem("userToken", userToken);
    localStorage.setItem("userId", userData.sub);
  }

  async function onSubmit() {
    const res = await fetch("/hentai-stalker/api/keywords/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: userToken,
        keywordId: uuidv4(),
        keyword: newKeyWord,
      }),
    });
    if (!res.ok) {
      console.error(res);
      return;
    }
    newKeyWord = "";
  }
</script>

<GoogleAuth
  authUrl="/hentai-stalker/api/auth"
  clientId="145848295246-nonmc4qqhlaphvjaj99t2n9qsivd90pa.apps.googleusercontent.com"
  on:success={onLoginSuccess}
  on:failed={() => console.log("login error")}
/>

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
