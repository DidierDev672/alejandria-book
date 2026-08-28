<template>
    <div class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" v-motion :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 250, ease: 'easeOut' } }"
        :leave="{ opacity: 0, transition: { duration: 200, ease: 'easeIn' } }">
    </div>
</template>