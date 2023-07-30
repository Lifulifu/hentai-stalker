<script lang="ts">
  import type { GalleryData } from "../types";
  import {formatDistanceToNow} from "date-fns"

  export let data: GalleryData = null;
</script>

<div>
  <a href={data.url} class="flex flex-col rounded-lg overflow-hidden">
    <img src={data.thumbUrl} alt="thumbnail" />
    <div class="bg-surface-50 p-2">
      <h1 class="font-extrabold">{data.title}</h1>
      <div class="text-surface-500">
        <span>{data.keyword}</span>
        <span class="mx-2">‧</span>
        <span>{formatDistanceToNow(Date.parse(data.postedTime))}</span>
      </div>
    </div>
  </a>
</div>
