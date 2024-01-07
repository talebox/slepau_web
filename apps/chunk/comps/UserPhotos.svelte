<script>
    import { stringToColour } from "@utils/utils";
    import { user_data } from "../store";
	import { user_claims } from "@stores/user";

    export let chunk;

    let user_photos = [];
    $: {
        const access = chunk?.props?.access ?? []
        const access_map = { Read: 1, Write: 2, Admin: 3 };
        let user_access = Object.fromEntries(
            access
                .map(({ user, access }) => [user, access])
                .sort((a, b) => access_map[b[1]] < access_map[a[1]]),
        );
        let users = new Set(access.map(({ user, access }) => user));
        users.add(chunk?.owner); // Add chunk owner
        users.delete(user_claims.user); // Remove ourselves
        users = user_data
            .get_photos([...users].sort())
            .sort((a, b) => !a.photo && !!b.photo);
        // console.log(users)
        // Rehydrate the users with their access
        users = users.map((u) => ({
            ...u,
            access:
                u.user === chunk?.owner ? "Admin" : user_access[u.user] ?? "Read",
        }));
        user_photos = users;
        
    }
    function user_decorator(access) {
        return `outline: 1px ${
            { Read: "none", Write: "dashed", Admin: "solid" }[access]
        } currentColor;`;
    }
</script>

{#each user_photos as { user, photo, access }, i}
    {#if i <= 3}
        {#if i === 3 && user_photos.length > 4}
            <div
                style="font-size:12px;width: 20px;height:20px;text-align:center"
            >
                +
            </div>
        {:else if photo}
            <img
                src={`/media/${photo}?max=21x21`}
                alt={`${user}'s photo`}
                style={`border-radius:99px;width: 21px;height:21px;${user_decorator(
                    access,
                )}`}
                srcset={`/media/${photo}?max=21x21,
                    /media/${photo}?max=42x42 2x,
                    /media/${photo}?max=84x84 3x
                    `}
            />
        {:else if user}
            <div
                style={`width: 21px;height:21px;border-radius:99px;background:${stringToColour(
                    user,
                )}66;font-size:14px;font-weight:bold;text-align:center;${user_decorator(
                    access,
                )}`}
            >
                {user.charAt(0).toUpperCase()}
            </div>
        {/if}
    {/if}
{/each}
