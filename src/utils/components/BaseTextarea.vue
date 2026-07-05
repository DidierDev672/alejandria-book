<script setup lang="ts">
const props = defineProps<{
    modelValue: string
    placeholder: string
    rows: number
    cols: number
    disabled: boolean
    readonly: boolean
    maxlength: number
    minlength: number
    required: boolean
    name: string
}>()
</script>