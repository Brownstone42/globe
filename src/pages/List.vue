<template>
    <the-header :page="'product'"></the-header>
    <div class="tabs is-toggle is-fullwidth is-small m-2">
        <ul class="custom-tabs">
            <li v-for="category in categories" :key="category"
            :class="{'is-active': selectedCategory == category}">
                <a @click="updateCategory(category)">{{ category }}</a>
            </li>
        </ul>
    </div>
    <div class="columns is-multiline mx-2">
        <div class="column is-one-third" v-for="product in filteredProducts" :key="product.id">
            <div class="card">
                <div class="card-image">
                    <figure class="image is-16by9">
                        <img :src="`/images/${product.selectedImage}`">
                    </figure>
                </div>
                <div class="card-content">
                    <p class="title is-5">{{ product.name }}</p>
                    <p class="subtitle is-6">{{ product.description }}</p>
                    <p><strong>Price:</strong> 10 บาท / คู่</p>
                    <p><strong>Sizes:</strong> {{ product.sizes.join(', ') }}</p>
                    <div class="buttons">
                        <button v-for="color in product.colors" key="color" class="button is-light"
                            :style="{ backgroundColor: color }" @click="product.selectedImage = product.images[color]">
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import theHeader from '../components/TheHeader.vue'

export default {
    data() {
        return {
            categories: ['Glove', 'Facemask', 'Shoecover', 'Cap', 'Bag', 'Other'],
            products: [
                {
                    id: 1,
                    name: 'Nylon glove white (I+SAFE)',
                    category: 'Glove',
                    description: 'ถุงมือผ้าไนล่อนเคลือบ PU เต็มฝ่ามือ ยี่ห้อ I+SAFE',
                    sizes: ['S','M','L'],
                    colors: ['white','green','gray'],
                    images: {
                        white: 'A-NPG-LG-000S-THAS.jpg',
                        green: 'A-NPG-LG-000M-THAS.jpg',
                        gray: 'A-NPG-LG-000L-THAS.jpg',
                    },
                    selectedImage: 'A-NPG-LG-000S-THAS.jpg'
                },
                {
                    id: 2,
                    name: 'Temp Facemask',
                    category: 'Facemask',
                    description: 'To be Added',
                    sizes: ['M','L'],
                    colors: ['red', 'blue'],
                    images: {
                        red: 'red.png',
                        blue: 'blue.png',
                    },
                    selectedImage: 'red.png'
                },
                {
                    id: 3,
                    name: 'Temp Glove 2',
                    category: 'Glove',
                    description: 'To be Added',
                    sizes: ['M','L'],
                    colors: ['red', 'blue'],
                    images: {
                        red: 'red.png',
                        blue: 'blue.png',
                    },
                    selectedImage: 'red.png'
                },
                {
                    id: 4,
                    name: 'Temp Glove 3',
                    category: 'Glove',
                    description: 'To be Added',
                    sizes: ['M','L'],
                    colors: ['red', 'blue'],
                    images: {
                        red: 'red.png',
                        blue: 'blue.png',
                    },
                    selectedImage: 'red.png'
                },
            ]
        }
    },
    components: {
        theHeader
    },
    computed: {
        selectedCategory() {
            return this.$route.query.category || 'Glove'
        },
        filteredProducts() {
            return this.products.filter(product => product.category == this.selectedCategory)
        }
    },
    methods: {
        updateCategory(category) {
            this.$router.push({
                path: this.$route.path,
                query: { category }
            });
        }
    }
}
</script>

<style scoped>
.custom-tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.custom-tabs li {
    flex: 1;
}
button {
    border: 1px solid black;
}
@media screen and (max-width: 768px) {
    .custom-tabs li {
        flex: 0 0 50%;
        text-align: center;
    }
}
</style>