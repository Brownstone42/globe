<template>
    <div class="header">
        <div class="is-flex is-justify-content-space-between is-full-width">
            <div class="is-flex flex-1 is-justify-content-center is-align-items-center">
                <span class="is-size-5 is-pointer" 
                    :class="{'is-active': page == 'about'}"
                    @click="navigate('/about')">
                    About Us
                </span>
            </div>
            <div class="is-flex flex-1 is-justify-content-center is-align-items-center">
                <span class="is-size-5 is-pointer" 
                    :class="{'is-active': page == 'product'}"
                    @click="navigate('/product')">
                    Our Products
                </span>
            </div>
            <div class="is-flex flex-1 is-justify-content-center is-align-items-center">
                <span class="is-size-5 is-pointer" 
                    :class="{'is-active': page == 'blogs'}"
                    @click="navigate('/blogs')">
                    Blogs
                </span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        page: {
            type: String
        }
    },
    methods: {
        navigate(path) {
            this.$router.push(path)
        }
    }
}
</script>

<style scoped>
.header {
    display: flex;
    position: sticky;
    z-index: 10;
    height: 75px;
    background-color: gray;
}
span.is-active {
    text-decoration: underline;
}
</style>