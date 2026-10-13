export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return Response.json(
        {
          ok: false,
          error:
            "This worker serves the TURBZ hunt and the Witch Circle. Username login, cloud autosave, and lobbies need the published TURBZ server, not a static asset worker. Offline, the hunt and the circle keep separate saves in the browser.",
        },
        { status: 501, headers: { "access-control-allow-origin": "*" } },
      );
    }
    return env.ASSETS.fetch(request);
  },
};
