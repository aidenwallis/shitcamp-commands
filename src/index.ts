import { formatDuration, intervalToDuration } from "date-fns";
import { Activity, ActivityState, getActivities } from "./shitcamp-api";

async function handleRequest(event: FetchEvent): Promise<Response> {
  const { searchParams } = new URL(event.request.url);
  const t = searchParams.get("type") || "latest";

  try {
    const activities = skipPastActivities(await getActivities(event));
    if (!activities.length) {
      return new Response("There are no future or current activities.");
    }

    const current: Activity | null =
      activities[0].state() === ActivityState.Active ? activities[0] : null;
    const next: Activity | null =
      (current ? activities[1] : activities[0]) || null;

    switch (t) {
      case "current": {
        return new Response(
          current ? currentActivity(current) : "There is no current activity.",
        );
      }

      case "next": {
        return new Response(
          next ? nextActivity(next) : "There are no future activities. :(",
        );
      }

      case "latest": {
        if (current) {
          return new Response(currentActivity(current));
        }
        if (next) {
          return new Response(nextActivity(next));
        }
        return new Response("There are no future activities. :(");
      }

      default: {
        return new Response("Type must be either 'current' or 'next'.", {
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log((error as Error).toString());
    return new Response("Failed to resolve activities.", { status: 400 });
  }
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

const currentActivity = (activity: Activity) => {
  return `${activity.name} is currently being streamed on ${activity.channelUrl}`;
};

const nextActivity = (activity: Activity) => {
  return `${activity.name} is next! Streamed in ${format(
    activity.startsAt,
  )} on ${activity.channelUrl}`;
};

const skipPastActivities = (v: Activity[]) => {
  for (let i = 0; i < v.length; ++i) {
    if (v[i].state() !== ActivityState.Past) {
      return v.slice(i);
    }
  }

  return v;
};

const format = (v: Date) =>
  formatDuration(
    intervalToDuration({
      start: v,
      end: new Date(),
    }),
    {
      delimiter: ", ",
    },
  );
