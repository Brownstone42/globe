import { defineStore } from 'pinia'
import { db, storage } from '../firebase'
import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

export const useCategoryProductStore = defineStore('categoryProduct', {
    state: () => ({
        categories: [],
        categoriesLoading: false,

        products: [],
        productsLoading: false,

        isAddingProduct: false,
        addProductMessage: '',
        addProductSuccess: false,
        isDeletingProduct: false,
        deleteProductMessage: '',
        deleteProductSuccess: false,
        isEditingProduct: false,
        editProductMessage: '',
        editProductSuccess: false,
    }),
    getters: {
        getAllCategories: (state) => state.categories,
        areCategoriesLoading: (state) => state.categoriesLoading,
        getAllProducts: (state) => state.products,
        areProductsLoading: (state) => state.productsLoading,
    },
    actions: {
        async fetchCategories() {
            this.categoriesLoading = true
            try {
                const categoriesRef = collection(db, 'categories')
                const querySnapshot = await getDocs(categoriesRef)
                this.categories = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.categories.sort((a, b) => a.name.localeCompare(b.name))
                console.log('Categories fetched:', this.categories)
            } catch (error) {
                console.error("Error fetching categories:", error)
                this.categories = []
            } finally {
                this.categoriesLoading = false
            }
        },
        async addCategory(newCategoryData) {
            if (!newCategoryData.name || !newCategoryData.image) {
                return { success: false, message: 'Category name and image cannot be empty.' }
            }

            const categoriesRef = collection(db, 'categories')
            const q = query(categoriesRef, where('name', '==', newCategoryData.name))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                return { success: false, message: 'Category with this name already exists.' }
            }

            try {
                await addDoc(categoriesRef, {
                    name: newCategoryData.name,
                    image: `categories/${newCategoryData.image}`
                })
                
                await this.fetchCategories()

                return { success: true, message: `Category "${newCategoryData.name}" added successfully!` }
            } catch (error) {
                console.error("Error adding category:", error)

                return { success: false, message: 'Error adding category. Please try again.' }
            }
        },
        async uploadImageToStorage(file, path) {
            try {
                const storageRef = ref(storage, path)

                await uploadBytes(storageRef, file)

                const downloadURL = await getDownloadURL(storageRef)
                console.log(`Image uploaded to ${path}, URL: ${downloadURL}`)

                return { success: true, url: downloadURL, path: path }
            } catch (error) {
                console.error("Error uploading image:", error)

                return { success: false, message: `Image upload failed: ${error.message}` }
            }
        },
        async addProduct(productData) {
            this.isAddingProduct = true
            this.addProductMessage = ''
            this.addProductSuccess = false

            if (!productData || !productData.name || !productData.category || !productData.price || !productData.unit || !productData.colors || productData.colors.length === 0) {
                this.addProductMessage = 'Please fill all required product fields.'
                this.addProductSuccess = false
                this.isAddingProduct = false

                return { success: false, message: 'Please fill all required product fields.' }
            }

            const defaultColor = productData.colors.find(color => color.default)

            if (!defaultColor) {
                this.addProductMessage = 'A default color image must be selected.'
                this.addProductSuccess = false
                this.isAddingProduct = false

                return { success: false, message: 'A default color image must be selected.' }
            }

            if (!productData.colors.every(color => color.name.trim() !== '' && color.file !== null)) {
                this.addProductMessage = 'All colors must have a name and an image file selected.'
                this.addProductSuccess = false
                this.isAddingProduct = false

                return { success: false, message: 'All colors must have a name and an image file selected.' }
            }

            let uploadedColors = [];
            let finalDefaultImagePath = ''

            try {
                for (const color of productData.colors) {
                    if (!color.file) {
                        console.warn(`Skipping color ${color.name} due to missing file.`)
                        continue
                    }

                    const fileExtension = color.file.name.split('.').pop()
                    const uniqueFilename = `${uuidv4()}.${fileExtension}`
                    const filePath = `products/${uniqueFilename}`

                    const uploadResult = await this.uploadImageToStorage(color.file, filePath)

                    if (uploadResult.success) {
                        uploadedColors.push({
                            name: color.name,
                            hex: color.hex || null,
                            image_path: filePath,
                            default: color.default || false
                        })

                        if (color.default) {
                            finalDefaultImagePath = filePath
                        }
                    } else {
                        throw new Error(`Failed to upload image for color ${color.name}: ${uploadResult.message}`)
                    }
                }

                if (!finalDefaultImagePath && uploadedColors.length > 0) {
                    const firstDefaultedColor = uploadedColors.find(c => c.default)
                    finalDefaultImagePath = firstDefaultedColor ? firstDefaultedColor.image_path : uploadedColors[0].image_path
                    if (!firstDefaultedColor) {
                        uploadedColors[0].default = true
                    }
                } else if (uploadedColors.length > 0 && !finalDefaultImagePath) {
                    finalDefaultImagePath = uploadedColors[0].image_path
                    uploadedColors[0].default = true
                }

                const productsRef = collection(db, 'products')

                await addDoc(productsRef, {
                    name: productData.name,
                    category: productData.category,
                    description: productData.description || '',
                    price: Number(productData.price),
                    unit: productData.unit,
                    sizes: productData.sizes || [],
                    colors: uploadedColors,
                    default_image_path: finalDefaultImagePath,
                    created_at: serverTimestamp(),
                })

                this.addProductMessage = `Product "${productData.name}" added successfully!`
                this.addProductSuccess = true

                await this.fetchAllProducts()
                return { success: true, message: this.addProductMessage }
            } catch (error) {
                console.error("Error adding product:", error)
                this.addProductMessage = `Error adding product: ${error.message}`
                this.addProductSuccess = false

                return { success: false, message: this.addProductMessage }
            } finally {
                this.isAddingProduct = false
            }
        },
        async fetchAllProducts() {
            this.productsLoading = true
            try {
                const productsRef = collection(db, 'products')
                const querySnapshot = await getDocs(productsRef)

                this.products = querySnapshot.docs.map(document => ({
                    id: document.id,
                    ...document.data()
                }))
                
                this.products.sort((a, b) => a.name.localeCompare(b.name))
                console.log('All products fetched for admin:', this.products)
            } catch (error) {
                console.error("Error fetching all products:", error)
                this.products = []
            } finally {
                this.productsLoading = false
            }
        },
        async updateProduct(productId, productData, originalImagePaths = []) {
            this.isEditingProduct = true
            this.editProductMessage = ''
            this.editProductSuccess = false

            if (!productData || !productData.name || !productData.category || !productData.price || !productData.unit || !productData.colors || productData.colors.length === 0) {
                this.editProductMessage = 'Please fill all required product fields.'
                this.editProductSuccess = false
                this.isEditingProduct = false
                return { success: false, message: 'Please fill all required product fields.' }
            }

            const defaultColor = productData.colors.find(color => color.default)

            if (!defaultColor) {
                this.editProductMessage = 'A default color image must be selected.'
                this.editProductSuccess = false
                this.isEditingProduct = false
                return { success: false, message: 'A default color image must be selected.' }
            }

            if (!productData.colors.every(color => color.name.trim() !== '' && (color.file !== null || color.image_path_original))) {
                this.editProductMessage = 'All colors must have a name and an image file (or original image) selected.'
                this.editProductSuccess = false
                this.isEditingProduct = false
                return { success: false, message: 'All colors must have a name and an image file (or original image) selected.' }
            }

            let updatedColors = []
            let finalDefaultImagePath = ''
            let retainedPaths = new Set()

            try {
                for (const color of productData.colors) {
                    let currentImagePath = ''
                    let defaultFlag = color.default || false

                    if (color.file) {
                        const fileExtension = color.file.name.split('.').pop()
                        const uniqueFilename = `${uuidv4()}.${fileExtension}`
                        const filePath = `products/${uniqueFilename}`

                        const uploadResult = await this.uploadImageToStorage(color.file, filePath)

                        if (!uploadResult.success) {
                            throw new Error(`Failed to upload new image for color ${color.name}: ${uploadResult.message}`)
                        }

                        currentImagePath = filePath
                    } else if (color.image_path_original) {
                        currentImagePath = color.image_path_original
                        retainedPaths.add(color.image_path_original)
                    } else {
                        console.warn(`Color ${color.name} has no file or original path. Skipping.`)
                        continue
                    }

                    updatedColors.push({
                        name: color.name,
                        hex: color.hex || null,
                        image_path: currentImagePath,
                        default: defaultFlag
                    })

                    if (defaultFlag) {
                        finalDefaultImagePath = currentImagePath
                    }
                }

                if (!finalDefaultImagePath && updatedColors.length > 0) {
                    const firstDefaultedColor = updatedColors.find(c => c.default)
                    finalDefaultImagePath = firstDefaultedColor ? firstDefaultedColor.image_path : updatedColors[0].image_path

                    if (!firstDefaultedColor) {
                        updatedColors[0].default = true
                    }
                } else if (updatedColors.length > 0 && !finalDefaultImagePath) {
                    finalDefaultImagePath = updatedColors[0].image_path
                    updatedColors[0].default = true
                }

                for (const originalPath of originalImagePaths) {
                    if (originalPath && !retainedPaths.has(originalPath)) {
                        try {
                            const fileRef = ref(storage, originalPath)
                            await deleteObject(fileRef);
                            console.log(`Deleted old image: ${originalPath}`)
                        } catch (deleteError) {
                            console.warn(`Could not delete old image ${originalPath}:`, deleteError.message)
                        }
                    }
                }

                const productDocRef = doc(db, 'products', productId)
                await updateDoc(productDocRef, {
                    name: productData.name,
                    category: productData.category,
                    description: productData.description || '',
                    price: Number(productData.price),
                    unit: productData.unit,
                    sizes: productData.sizes || [],
                    colors: updatedColors,
                    default_image_path: finalDefaultImagePath
                })

                this.editProductMessage = `Product "${productData.name}" updated successfully!`
                this.editProductSuccess = true
                await this.fetchAllProducts()
                return { success: true, message: this.editProductMessage }
            } catch (error) {
                console.error("Error updating product:", error)
                this.editProductMessage = `Error updating product: ${error.message}`
                this.editProductSuccess = false
                return { success: false, message: this.editProductMessage }
            } finally {
                this.isEditingProduct = false
            }
        },
        async deleteProduct(productId, imagePaths = []) {
            this.isDeletingProduct = true
            this.deleteProductMessage = ''
            this.deleteProductSuccess = false

            try {
                for (const path of imagePaths) {
                    if (path) {
                        try {
                            const fileRef = ref(storage, path)
                            await deleteObject(fileRef)
                            console.log(`Deleted image from Storage: ${path}`)
                        } catch (storageError) {
                            console.warn(`Could not delete image ${path} from storage:`, storageError.message)
                        }
                    }
                }

                const productDocRef = doc(db, 'products', productId)
                await deleteDoc(productDocRef)

                this.deleteProductMessage = 'Product deleted successfully!'
                this.deleteProductSuccess = true
                await this.fetchAllProducts()
                return { success: true, message: this.deleteProductMessage }
            } catch (error) {
                console.error("Error deleting product:", error)
                this.deleteProductMessage = `Error deleting product: ${error.message}`
                this.deleteProductSuccess = false
                return { success: false, message: this.deleteProductMessage }
            } finally {
                this.isDeletingProduct = false
            }
        }
    },
});