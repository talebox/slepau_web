<script>
    /**
     * Paged view will pull the needed paginated data to fill the screen.
     * Then some more as necessary.
     *
     * There's two types of pagination:
     * - Cursor based (before/after & limit)
     * - Offset based (offset & limit)
     *
     * Cursor based defines an id from which to go off of.
     * Then how many (limit) records `before`, or `after` that id.
     *
     * Offset based defines a number of records to skip (offset), and how many to take (limit).
     *
     * ---
     *
     * Really pagination is a dance between backend and frontend state.
     *
     * Backend is simple, just answer frontend based on what it wants.
     * Frontend holds a cache + asks backend for more if the user scrolls.
     *  Now, tackling the frontend cache thing we have an object of {id: record} that gets updated based on data received.
     *  Views say, hey, make me a PaginatedView for 'x' which I need. But they also have to tell the view that the user is requesting more data after, or before.
     *  So the best approach might be to make a PaginatedView class that stores this info and can a
     *
     */
    import { db } from "./store";

    export let medias = [];

    let incoming = db.subscribeTo("views/all/paged", { request_on: false });

    $: {
        if ($incoming) {
            console.log($incoming);
            const {
                query: { cursor, limit },
            } = $incoming;
            if (cursor) {
                const { before, after } = cursor;
                let id = before ?? after;
                let i = id ? medias.findIndex((v) => v.id === id) : -1;
                if (i >= 0) {
                    if (before) {
                        medias.splice(i - limit, limit, ...$incoming.data);
                    } else {
                        medias.splice(i, limit, ...$incoming.data);
                    }
                    medias = medias;
                }
            } else {
                medias = $incoming.data;
            }
        }
    }
    $: console.log(medias);

    db.send({ resource: "views/all/paged" });
</script>

Hello
