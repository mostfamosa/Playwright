<script lang="ts">
    export let checked = false;
    export let onChanged: (newVal: boolean) => void | undefined = undefined;

    function onInputChange(evt) {
        checked = evt.currentTarget.checked;
        if (onChanged) {
            onChanged(checked);
        }
    }
</script>

<label class="switch">
    <input type="checkbox" {checked} on:change={onInputChange} />
    <span class="slider" />
</label>

<style>
    .switch {
        position: relative;
        display: inline-block;
        width: 40px;
        min-width: 40px;
        height: 24px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: 0.4s;
        transition: 0.4s;
        border-radius: 24px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: 0.4s;
        transition: 0.4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #0d3ecc;
    }

    input:checked + .slider {
        box-shadow: 0 0 1px #0d3ecc;
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(16px);
        -ms-transform: translateX(16px);
        transform: translateX(16px);
    }

    @media (prefers-color-scheme: dark) {
        input:checked + .slider {
            background-color: #7a95e3;
        }

        input:checked + .slider {
            box-shadow: 0 0 1px #7a95e3;
        }

        .slider {
            background-color: #515565;
        }
    }
</style>
