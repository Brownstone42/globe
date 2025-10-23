<template>
    <the-header :page="'product'"></the-header>
    <div class="page is-flex">
        <div class="columns is-multiline m-2">
            <div class="column is-one-third p-4" v-for="category in categories" :key="category.id">
                <figure class="image is-4by3 category-item" @click="navigate(category.title)">
                    <img :src="`/images/${category.image}`" class="category-image">
                    <div class="image-overlay"></div>
                    <span class="category-title">{{ category.title }}</span>
                </figure>
            </div>
        </div>
    </div>
</template>

<script>
import theHeader from '../components/TheHeader.vue'

export default {
    data() {
        return {
            categories: [
                {
                    id: 1,
                    title: 'Glove',
                    image: 'glove.jpg'
                },
                {
                    id: 2,
                    title: 'Facemask',
                    image: 'facemask.jpg'
                },
                {
                    id: 3,
                    title: 'Shoecover',
                    image: 'blank_image.jpg'
                },
                {
                    id: 4,
                    title: 'Cap',
                    image: 'blank_image.jpg'
                },
                {
                    id: 5,
                    title: 'Bag',
                    image: 'blank_image.jpg'
                },
                {
                    id: 6,
                    title: 'Other',
                    image: 'blank_image.jpg'
                },
            ]
        }
    },
    components: {
        theHeader
    },
    methods: {
        navigate(category) {
            this.$router.push({
                path: '/product/list',
                query: { category }
            })
        }
    }
}
</script>

<style scoped>
div.page {
    flex-direction: column;
    height: calc(100vh - 130px);
    background-color: lightgray;
    overflow-y: auto;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
figure {
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.category-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(2px); /* Initially blurred */
    transition: filter 0.3s ease-in-out;
}
.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3); /* Dark overlay for contrast */
    transition: background 0.3s ease-in-out;
}
.category-title {
    position: absolute;
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    z-index: 2;
    background: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 5px;
    transition: opacity 0.3s ease-in-out;
}

/* Hover effect: remove blur and hide text */
.category-item:hover .category-image {
    filter: blur(0);
}
.category-item:hover .category-title {
    opacity: 0;
}
.category-item:hover .image-overlay {
    background: rgba(0, 0, 0, 0); /* Remove dark overlay */
}
</style>