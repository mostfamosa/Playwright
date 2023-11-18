<script>
    const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    export let isPaused;
</script>

{#if !isDarkMode}
    {#if !isPaused}
        <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="48" cy="48" r="44" stroke="#B6C5F0" stroke-width="8" />
            <path
                d="M66.2803 37.6131L43.613 60.2803L28.9999 45.6672"
                stroke="#3D65D6"
                stroke-width="6"
            />
        </svg>
    {:else}
        <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="48" cy="48" r="44" stroke="#DCDDE0" stroke-width="8" />
            <rect x="36" y="28" width="8" height="40" fill="#DCDDE0" />
            <rect x="52" y="28" width="8" height="40" fill="#DCDDE0" />
        </svg>
    {/if}
{:else if !isPaused}
    <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="48" cy="48" r="44" stroke="#B6C5F0" stroke-width="8" />
        <path
            d="M66.2803 37.6131L43.613 60.2803L28.9999 45.6672"
            stroke="#7A95E3"
            stroke-width="6"
        />
    </svg>
{:else}
    <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="48" cy="48" r="44" stroke="#747784" stroke-width="8" />
        <rect x="36" y="28" width="8" height="40" fill="#747784" />
        <rect x="52" y="28" width="8" height="40" fill="#747784" />
    </svg>
{/if}
