<script lang="ts">
  import type { GalleryData } from "../types";
  import {formatDistanceToNow} from "date-fns"
  import {parseDate} from "./util"

  export let data: GalleryData = null;
</script>

<a href={data.url} class="flex flex-col rounded-lg overflow-hidden box-border hover:border-2 border-primary-500">
  <img src={data.thumbUrl} alt="thumbnail" />
  <div class="bg-surface-50 p-2">
    <h1 class="font-extrabold">{data.title}</h1>
    <div class="text-surface-500">
      <span>{data.keyword}</span>
      <span class="mx-2">‧</span>
      <span>{formatDistanceToNow(parseDate(data.postedTime))}</span>
    </div>
  </div>
</a>
