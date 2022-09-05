export type ShitcampActivities = {
  activities: ShitcampActivity[];
};

export type ShitcampActivity = {
  channel: string;
  channel_url: string;
  description: string;
  end_time: string;
  featured_channels: ShitcampChannel[];
  id: number;
  name: string;
  short_name: string;
  start_time: string;
  thumbnail_url: string;
};

export type ShitcampChannel = {
  channel: string;
  channel_url: string;
};

const API_ENDPOINT = "https://api.shitcamp.live/schedule?event_id=4";

// 10 min cache, schedule is unlikely to constantly change, and we do the actual math uncached
const CACHE_TIME_SECONDS = 600;

export async function getActivities(event: FetchEvent): Promise<Activity[]> {
  const request = new Request(API_ENDPOINT, { method: "GET" });
  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  // cache miss
  if (!response) {
    response = await fetch(request);
    response = new Response(response.body, response);

    // cache API respects cache headers
    response.headers.append("Cache-Control", `s-maxage=${CACHE_TIME_SECONDS}`);

    // allows us to ensure we write to cache without blocking request handling
    event.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return (
    ((await response.json()) as ShitcampActivities)?.activities || []
  ).map((a) => new Activity(a));
}

export enum ActivityState {
  Active,
  Past,
  Future,
}

export class Activity {
  public readonly name: string;
  public readonly startsAt: Date;
  public readonly endsAt: Date;
  public readonly channelUrl: string;

  public constructor(activity: ShitcampActivity) {
    this.name = activity.name;
    this.startsAt = new Date(activity.start_time);
    this.endsAt = new Date(activity.end_time);
    this.channelUrl = activity.channel_url;
  }

  public state(): ActivityState {
    if (this.isActive()) {
      return ActivityState.Active;
    }
    if (this.hasEnded()) {
      return ActivityState.Past;
    }
    return ActivityState.Future;
  }

  public hasStarted(): boolean {
    return Date.now() >= this.startsAt.getTime();
  }

  public hasEnded(): boolean {
    return Date.now() >= this.endsAt.getTime();
  }

  public isActive(): boolean {
    return this.hasStarted() && !this.hasEnded();
  }
}
