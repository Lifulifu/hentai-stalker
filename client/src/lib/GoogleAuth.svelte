<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let clientId;
  let loginContainer: HTMLDivElement;

  onMount(() => {
    let gsiScript = document.createElement("script");
    gsiScript.src = "https://accounts.google.com/gsi/client";
    gsiScript.defer = true;
    gsiScript.async = true;
    document.body.appendChild(gsiScript);

    gsiScript.onload = () => {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(loginContainer, { theme: "filled_blue" });
      google.accounts.id.prompt();
    };
  });

  function handleCredentialResponse(e) {
    console.log(e);
  }
</script>

<div bind:this={loginContainer} />
