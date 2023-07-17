<script>
  import { Modal, modalStore } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import GoogleAuth from "./lib/GoogleAuth.svelte";
</script>

<GoogleAuth
  clientId="145848295246-nonmc4qqhlaphvjaj99t2n9qsivd90pa.apps.googleusercontent.com"
  on:success={(e) => console.dir(e.detail)}
/>
