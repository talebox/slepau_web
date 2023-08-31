<script>
    let rows = [
        ["Item", "Amount"],
        ["Jugs", "21"],
        ["Cats", "3"],
    ];
</script>

<button
    on:click={() => {
        rows.push(new Array(rows[0]?.length || 0).fill(""));
        rows = rows;
    }}
>
    Row +
</button>

<button
    on:click={() => {
        if (rows.length > 1) rows.pop();
        rows = rows;
    }}>Row -</button
>
<button
    on:click={() => {
        rows.forEach((v) => v.push(""));
        rows = rows;
    }}>Col +</button
>
<button
    on:click={() => {
        rows.forEach((v) => {
            if (v.length > 1) v.pop();
        });
        rows = rows;
    }}>Col -</button
>
<table>
    {#each rows as row}
        <tr>
            {#each row as col}
                <td class="td" contenteditable bind:innerHTML={col} />
            {/each}
        </tr>
    {/each}
</table>

<style>
    .td {
        border: 1px solid #777;
        height: calc(1em + 16px);
    }
</style>
