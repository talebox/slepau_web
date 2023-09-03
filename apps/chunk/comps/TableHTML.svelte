<script>
    export let value="<tr><td>Hello World!</td></tr>";
    let table;
</script>

<button
    on:click={() => {
        const max_cells = new Array(...table.rows).reduce((a,r) => Math.max(r.children.length, a), 0);
        const new_row = table.insertRow();
        for(let i=0;i<max_cells;++i){
            new_row.insertCell();
        }
    }}
>
    Row +
</button>

<!-- <button
    on:click={() => {
        if (rows.length > 1) rows.pop();
        rows = rows;
    }}>Row -</button> -->
<!-- <button
    on:click={() => {
        rows.forEach((v) => v.push(""));
        rows = rows;
    }}>Col +</button>
<button
    on:click={() => {
        rows.forEach((v) => {
            if (v.length > 1) v.pop();
        });
        rows = rows;
    }}>Col -</button> -->
<table class="table-editable" bind:this={table} contenteditable bind:innerHTML={value} />

<style>
    
</style>
