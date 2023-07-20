<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let clientId: string;
  export let authUrl: string;
  let loginContainer: HTMLDivElement;

  onMount(() => {
    // load google js api script
    let script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);

    // use 'google' variable from the script
    script.onload = (e) => {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(loginContainer, {
        type: "standard",
      });
    };
  });

  async function handleCredentialResponse(res) {
    var token = res.credential;
    try {
      let authResult = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      if (!authResult.ok) {
        dispatch("failed");
        return;
      }
      authResult = await authResult.json();
      dispatch("success", { ...authResult, token });
    } catch (e) {
      console.error("authorization failed.", e);
      dispatch("failed");
    }
  }
</script>

<div bind:this={loginContainer} />
