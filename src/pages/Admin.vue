<template>
	<the-header :page="''"></the-header>
	<div class="container is-fluid mt-4">
		<h1 class="title is-3">Admin Panel</h1>
		<p class="subtitle is-5">
			Welcome,
			{{ authStore.currentUser ? authStore.currentUser.email : "Admin" }}!
		</p>

		<div class="buttons">
			<button class="button is-danger" @click="handleSignOut">
				Sign Out
			</button>
		</div>

		<hr />

		<div class="columns">
			<div class="column is-4">
				<h2 class="title is-4">Manage Categories</h2>
				<div class="box">
					<h3 class="title is-5">Add New Category</h3>

					<div class="field">
						<label class="label">Category Name</label>
						<div class="control">
							<input
								class="input"
								type="text"
								v-model="newCategoryName"
								placeholder="e.g., Glove, Facemask"
							/>
						</div>
					</div>

					<div class="field">
						<label class="label"
							>Category Image File Name (e.g., glove.jpg)</label
						>
						<div class="control">
							<input
								class="input"
								type="text"
								v-model="newCategoryImage"
								placeholder="e.g., glove.jpg"
							/>
							<p class="help">
								Ensure this image file exists in your Firebase
								Storage 'categories' folder.
							</p>
						</div>
					</div>

					<div class="field">
						<div class="control">
							<button
								class="button is-primary"
								@click="addCategory"
								:disabled="
									!newCategoryName ||
									!newCategoryImage ||
									isAddingCategory
								"
							>
								{{
									isAddingCategory
										? "Adding..."
										: "Add Category"
								}}
							</button>
						</div>
					</div>

					<p
						v-if="addCategoryMessage"
						:class="{
							'has-text-success': addCategorySuccess,
							'has-text-danger': !addCategorySuccess,
						}"
					>
						{{ addCategoryMessage }}
					</p>
				</div>

				<h3 class="title is-5 mt-5">Existing Categories</h3>
				<div v-if="categoriesLoading" class="has-text-centered">
					<i class="fas fa-spinner fa-spin fa-2x"></i> Loading
					Categories...
				</div>
				<div
					v-else-if="categories.length === 0"
					class="has-text-centered"
				>
					No categories found.
				</div>
				<table
					v-else
					class="table is-fullwidth is-striped is-hoverable"
				>
					<thead>
						<tr>
							<th>Name</th>
							<th>Image</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="cat in categories" :key="cat.id">
							<td>{{ cat.name }}</td>
							<td>{{ cat.image }}</td>
							<td>
								<button
									class="button is-small is-warning is-light mr-2"
								>
									Edit
								</button>
								<button
									class="button is-small is-danger is-light"
								>
									Delete
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="column is-8">
				<h2 class="title is-4">Manage Products (Coming Soon)</h2>
				<div class="box">
					<h3 class="title is-5">Add New Product</h3>

					<div class="field">
						<label class="label"
							>Product Name
							<span class="has-text-danger">*</span></label
						>
						<div class="control">
							<input
								class="input"
								type="text"
								v-model="newProduct.name"
								placeholder="e.g., Nylon glove white (I+SAFE)"
							/>
						</div>
					</div>

					<div class="field">
						<label class="label"
							>Category
							<span class="has-text-danger">*</span></label
						>
						<div class="control">
							<div class="select is-fullwidth">
								<select v-model="newProduct.category">
									<option value="" disabled>
										Select a category
									</option>
									<option
										v-for="cat in categories"
										:key="cat.id"
										:value="cat.name"
									>
										{{ cat.name }}
									</option>
								</select>
							</div>
						</div>
					</div>

					<div class="field">
						<label class="label">Description</label>
						<div class="control">
							<textarea
								class="textarea"
								v-model="newProduct.description"
								placeholder="Product description"
							></textarea>
						</div>
					</div>

					<div class="field-body">
						<div class="field">
							<label class="label"
								>Price
								<span class="has-text-danger">*</span></label
							>
							<div class="control">
								<input
									class="input"
									type="number"
									v-model.number="newProduct.price"
									min="0"
									step="any"
								/>
							</div>
						</div>
						<div class="field">
							<label class="label"
								>Unit
								<span class="has-text-danger">*</span></label
							>
							<div class="control">
								<input
									class="input"
									type="text"
									v-model="newProduct.unit"
									placeholder="e.g. คู่, กล่อง"
								/>
							</div>
						</div>
					</div>

					<div class="field mt-4">
						<label class="label"
							>Sizes (comma separated, e.g., S,M,L)</label
						>
						<div class="control">
							<input
								class="input"
								type="text"
								v-model="newProductSizesInput"
								placeholder="S,M,L"
							/>
						</div>
					</div>

					<hr />

					<h4 class="title is-6">
						Product Colors & Images
						<span class="has-text-danger">*</span>
					</h4>

					<div
						v-for="(color, index) in newProduct.colors"
						:key="`new-color-${index}`"
						class="box p-3 mb-3"
					>
						<div class="field is-grouped is-grouped-multiline">
							<div class="control">
								<input
									class="input"
									type="text"
									v-model="color.name"
									placeholder="Color Name (e.g., White)"
									required
								/>
							</div>

							<div class="control">
								<input
									class="input"
									type="color"
									v-model="color.hex"
									title="Pick a color hex code"
									:style="{ backgroundColor: color.hex }"
								/>
							</div>

							<div class="control is-expanded">
								<div class="file has-name is-fullwidth">
									<label class="file-label">
										<input
											class="file-input"
											type="file"
											@change="
												handleColorImageUpload(
													$event,
													index,
													newProduct
												)
											"
											accept="image/*"
										/>
										<span class="file-cta">
											<span class="file-icon">
												<i class="fas fa-upload"></i>
											</span>
											<span class="file-label">
												{{
													color.file
														? color.file.name
														: "Choose image file..."
												}}
											</span>
										</span>
										<span
											v-if="color.file"
											class="file-name"
										>
											{{ color.file.name }}
										</span>
										<span v-else class="file-name">
											No file chosen
										</span>
									</label>
								</div>
							</div>

							<div class="control">
								<button
									v-if="newProduct.colors.length > 1"
									class="button is-danger is-light"
									@click="removeColor(index, newProduct)"
								>
									Remove
								</button>
							</div>
						</div>
						<div class="field mt-3">
							<label class="checkbox">
								<input
									type="radio"
									:value="color.name"
									:checked="color.default"
									@change="
										setDefaultColor(newProduct, color.name)
									"
								/>
								Set as Default Image
							</label>
						</div>
					</div>

					<button
						class="button is-info is-light mb-4"
						@click="addColor(newProduct)"
					>
						Add Another Color
					</button>

					<div class="field">
						<div class="control">
							<button
								class="button is-primary is-large is-fullwidth"
								@click="addProduct"
								:disabled="
									!isProductFormValid || isAddingProduct
								"
							>
								{{
									isAddingProduct
										? "Adding Product..."
										: "Add Product"
								}}
							</button>
						</div>
					</div>

					<p
						v-if="addProductMessage"
						:class="{
							'has-text-success': addProductSuccess,
							'has-text-danger': !addProductSuccess,
						}"
					>
						{{ addProductMessage }}
					</p>
				</div>

				<h3 class="title is-5 mt-5">Existing Products</h3>
				<p
					v-if="deleteProductMessage"
					:class="{
						'has-text-success': deleteProductSuccess,
						'has-text-danger': !deleteProductSuccess,
					}"
				>
					{{ deleteProductMessage }}
				</p>
				<div v-if="productsLoading" class="has-text-centered">
					<i class="fas fa-spinner fa-spin fa-2x"></i> Loading
					Products...
				</div>
				<div
					v-else-if="allProducts.length === 0"
					class="has-text-centered"
				>
					No products found.
				</div>

				<table
					v-else
					class="table is-fullwidth is-striped is-hoverable"
				>
					<thead>
						<tr>
							<th>Name</th>
							<th>Category</th>
							<th>Price</th>
							<th>Unit</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="product in allProducts" :key="product.id">
							<td>{{ product.name }}</td>
							<td>{{ product.category }}</td>
							<td>{{ product.price }}</td>
							<td>{{ product.unit }}</td>
							<td>
								<button
									class="button is-small is-warning mr-2"
									@click="openEditModal(product)"
								>
									Edit
								</button>
								<button
									class="button is-small is-danger"
									@click="confirmDelete(product)"
									:disabled="isDeletingProduct"
								>
									Delete
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div :class="{ modal: true, 'is-active': isEditModalActive }">
			<div class="modal-background" @click="closeEditModal"></div>
			<div class="modal-card" v-if="editingProduct">
				<header class="modal-card-head">
					<p class="modal-card-title">
						Edit Product: {{ editingProduct.name }}
					</p>
					<button
						class="delete"
						aria-label="close"
						@click="closeEditModal"
					></button>
				</header>

				<section class="modal-card-body">
					<p
						v-if="editProductMessage"
						:class="{
							'has-text-success': editProductSuccess,
							'has-text-danger': !editProductSuccess,
						}"
					>
						{{ editProductMessage }}
					</p>

					<div class="field">
						<label class="label"
							>Product Name
							<span class="has-text-danger">*</span></label
						>
						<div class="control">
							<input
								class="input"
								type="text"
								v-model="editingProduct.name"
							/>
						</div>
					</div>

					<div class="field">
						<label class="label"
							>Category
							<span class="has-text-danger">*</span></label
						>
						<div class="control">
							<div class="select is-fullwidth">
								<select v-model="editingProduct.category">
									<option value="" disabled>
										Select a category
									</option>
									<option
										v-for="cat in categories"
										:key="cat.id"
										:value="cat.name"
									>
										{{ cat.name }}
									</option>
								</select>
							</div>
						</div>
					</div>

					<div class="field">
						<label class="label">Description</label>
						<div class="control">
							<textarea
								class="textarea"
								v-model="editingProduct.description"
							></textarea>
						</div>
					</div>

					<div class="field-body">
						<div class="field">
							<label class="label"
								>Price
								<span class="has-text-danger">*</span></label
							>
							<div class="control">
								<input
									class="input"
									type="number"
									v-model.number="editingProduct.price"
									min="0"
									step="any"
								/>
							</div>
						</div>
						<div class="field">
							<label class="label"
								>Unit
								<span class="has-text-danger">*</span></label
							>
							<div class="control">
								<input
									class="input"
									type="text"
									v-model="editingProduct.unit"
								/>
							</div>
						</div>
					</div>

					<div class="field">
						<label class="label"
							>Sizes (comma separated, e.g., S,M,L)</label
						>
						<div class="control">
							<input
								class="input"
								type="text"
								v-model="editingProductSizesInput"
								placeholder="S,M,L"
							/>
						</div>
					</div>

					<hr />

					<h4 class="title is-6">
						Product Colors & Images
						<span class="has-text-danger">*</span>
					</h4>
					<div
						v-for="(color, index) in editingProduct.colors"
						:key="`edit-color-${index}`"
						class="box p-3 mb-3"
					>
						<div class="field is-grouped is-grouped-multiline">
							<div class="control">
								<input
									class="input"
									type="text"
									v-model="color.name"
									placeholder="Color Name (e.g., White)"
									required
								/>
							</div>

							<div class="control">
								<input
									class="input"
									type="color"
									v-model="color.hex"
									title="Pick a color hex code"
									:style="{ backgroundColor: color.hex }"
								/>
							</div>

							<div class="control is-expanded">
								<div class="file has-name is-fullwidth">
									<label class="file-label">
										<input
											class="file-input"
											type="file"
											@change="
												handleColorImageUploadEdit(
													$event,
													index,
													editingProduct
												)
											"
											accept="image/*"
										/>
										<span class="file-cta">
											<span class="file-icon">
												<i class="fas fa-upload"></i>
											</span>
											<span class="file-label">
												{{
													color.file
														? color.file.name
														: color.image_path_original
														? "Change image..."
														: "Choose image..."
												}}
											</span>
										</span>
										<span
											v-if="color.file"
											class="file-name"
										>
											{{ color.file.name }}
										</span>
										<span
											v-else-if="
												color.image_path_original
											"
											class="file-name"
										>
											{{
												color.image_path_original
													.split("/")
													.pop()
											}}
										</span>
										<span v-else class="file-name">
											No file chosen
										</span>
									</label>
								</div>
							</div>

							<div class="control">
								<button
									v-if="editingProduct.colors.length > 1"
									class="button is-danger is-light"
									@click="removeColor(index, editingProduct)"
								>
									Remove
								</button>
							</div>
						</div>

						<div class="field mt-3">
							<label class="checkbox">
								<input
									type="radio"
									:value="color.name"
									:checked="color.default"
									@change="
										setDefaultColor(
											editingProduct,
											color.name
										)
									"
								/>
								Set as Default Image
							</label>
						</div>

						<p
							v-if="color.image_path_original && !color.file"
							class="help"
						>
							Current image:
							{{ color.image_path_original.split("/").pop() }}
						</p>
					</div>
				</section>

				<footer class="modal-card-foot">
					<button
						class="button is-primary"
						@click="updateProduct"
						:disabled="
							!isEditingProductFormValid || isEditingProduct
						"
					>
						{{
							isEditingProduct
								? "Updating Product..."
								: "Save Changes"
						}}
					</button>
					<button class="button" @click="closeEditModal">
						Cancel
					</button>
				</footer>
			</div>
		</div>
	</div>
</template>

<script>
import TheHeader from "../components/TheHeader.vue";
import { useAuthStore } from "../stores/auth";
import { useCategoryProductStore } from "../stores/categoryProduct";
import { mapState } from "pinia";

export default {
	components: {
		TheHeader,
	},
	data() {
		return {
			authStore: null,
			categoryProductStore: null,
			newCategoryName: "",
			newCategoryImage: "",
			isAddingCategory: false,
			addCategoryMessage: "",
			addCategorySuccess: false,

			newProduct: {
				name: "",
				category: "",
				description: "",
				price: 0,
				unit: "",
				sizes: [],
				colors: [
					{ name: "", hex: "#ffffff", file: null, default: true },
				],
			},

			newProductSizesInput: "",
			isAddingProduct: false,
			addProductMessage: "",
			addProductSuccess: false,

			isEditModalActive: false,
			editingProduct: null,
			editingProductSizesInput: "",
			isEditingProduct: false,
			editProductMessage: "",
			editProductSuccess: false,

			isDeletingProduct: false,
			deleteProductMessage: "",
			deleteProductSuccess: false,

			originalProductImagePathsForDeletion: [],
		};
	},
	async beforeMount() {
		this.authStore = useAuthStore();
		this.categoryProductStore = useCategoryProductStore();

		await Promise.all([
			this.categoryProductStore.fetchCategories(),
			this.categoryProductStore.fetchAllProducts(),
		]);
	},
	computed: {
		...mapState(useCategoryProductStore, [
			"categories",
			"categoriesLoading",
			"products",
			"productsLoading",
		]),
		allProducts() {
			return this.products || [];
		},
		isProductFormValid() {
			const product = this.newProduct;
			const hasDefaultColor = product.colors.some(
				(color) => color.default
			);

			return (
				product.name.trim() !== "" &&
				product.category.trim() !== "" &&
				product.price > 0 &&
				product.unit.trim() !== "" &&
				product.colors.length > 0 &&
				product.colors.every(
					(color) => color.name.trim() !== "" && color.file !== null
				) &&
				hasDefaultColor
			);
		},
		isEditingProductFormValid() {
			if (!this.editingProduct) {
				return false;
			}

			const product = this.editingProduct;
			const hasDefaultColor = product.colors.some(
				(color) => color.default
			);

			return (
				product.name &&
				product.name.trim() !== "" &&
				product.category &&
				product.category.trim() !== "" &&
				typeof product.price === "number" &&
				product.price > 0 &&
				product.unit &&
				product.unit.trim() !== "" &&
				product.colors &&
				product.colors.length > 0 &&
				product.colors.every(
					(color) =>
						color.name &&
						color.name.trim() !== "" &&
						(color.file !== null || color.image_path_original)
				) &&
				hasDefaultColor
			);
		},
	},
	watch: {
		newProductSizesInput(newValue) {
			this.newProduct.sizes = newValue
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
		},
		editingProductSizesInput(newValue) {
			if (this.editingProduct) {
				this.editingProduct.sizes = newValue
					.split(",")
					.map((s) => s.trim())
					.filter((s) => s.length > 0);
			}
		},
	},
	methods: {
		async handleSignOut() {
			await this.authStore.signOutUser();
			this.$router.push("/product");
		},
		async addCategory() {
			this.isAddingCategory = true;
			this.addCategoryMessage = "";
			this.addCategorySuccess = false;

			const response = await this.categoryProductStore.addCategory({
				name: this.newCategoryName,
				image: this.newCategoryImage,
			});

			if (response.success) {
				this.addCategoryMessage = response.message;
				this.addCategorySuccess = true;
				this.newCategoryName = "";
				this.newCategoryImage = "";
			} else {
				this.addCategoryMessage = response.message;
				this.addCategorySuccess = false;
			}
			this.isAddingCategory = false;
		},
		addColor(productObject) {
			if (productObject) {
				productObject.colors = [
					...productObject.colors,
					{ name: "", hex: "#ffffff", file: null, default: false },
				];
			}
		},
		removeColor(index, productObject) {
			if (productObject) {
				const wasDefault = productObject.colors[index].default;
				productObject.colors.splice(index, 1);

				if (wasDefault && productObject.colors.length > 0) {
					productObject.colors[0].default = true;
				}
			}
		},
		handleColorImageUpload(event, index, productObject) {
			const file = event.target.files[0];
			if (file) {
				productObject.colors[index].file = file;
			} else {
				productObject.colors[index].file = null;
			}
		},
		setDefaultColor(productObject, selectedColorName) {
			productObject.colors.forEach((color) => {
				color.default = color.name === selectedColorName;
			});
		},
		async addProduct() {
			this.isAddingProduct = true;
			this.addProductMessage = "";
			this.addProductSuccess = false;

			if (!this.isProductFormValid) {
				this.addProductMessage =
					"Please fill all required fields, ensure images are selected for all colors, and set a default image.";
				this.addProductSuccess = false;
				this.isAddingProduct = false;
				return;
			}

			const response = await this.categoryProductStore.addProduct(
				this.newProduct
			);

			if (response.success) {
				this.addProductMessage = response.message;
				this.addProductSuccess = true;

				this.newProduct = {
					name: "",
					category: "",
					description: "",
					price: 0,
					unit: "",
					sizes: [],
					colors: [
						{ name: "", hex: "#ffffff", file: null, default: true },
					],
				};

				this.newProductSizesInput = "";
			} else {
				this.addProductMessage = response.message;
				this.addProductSuccess = false;
			}
			this.isAddingProduct = false;
		},
		openEditModal(product) {
			this.editingProduct = JSON.parse(JSON.stringify(product));
			this.originalProductImagePathsForDeletion = product.colors
				.map((color) => color.image_path)
				.filter(Boolean);
			this.editingProduct.colors = this.editingProduct.colors.map(
				(color) => ({
					...color,
					file: null,
					image_path_original: color.image_path,
				})
			);
			this.editingProductSizesInput = this.editingProduct.sizes.join(",");
			this.editProductMessage = "";
			this.editProductSuccess = false;
			this.isEditModalActive = true;
		},
		closeEditModal() {
			this.isEditModalActive = false;
			this.editingProduct = null;
			this.editingProductSizesInput = "";
			this.originalProductImagePathsForDeletion = [];
		},
		handleColorImageUploadEdit(event, index, productObject) {
			const file = event.target.files[0];
			if (file) {
				productObject.colors[index].file = file;
			} else {
				productObject.colors[index].file = null;
			}
		},
		async updateProduct() {
			this.isEditingProduct = true;
			this.editProductMessage = "";
			this.editProductSuccess = false;

			if (!this.isEditingProductFormValid) {
				this.editProductMessage =
					"Please fill all required fields, ensure images are selected for all colors, and set a default image.";
				this.editProductSuccess = false;
				this.isEditingProduct = false;
				return;
			}

			const response = await this.categoryProductStore.updateProduct(
				this.editingProduct.id,
				this.editingProduct,
				this.originalProductImagePathsForDeletion
			);

			if (response.success) {
				this.editProductMessage = response.message;
				this.editProductSuccess = true;
				setTimeout(() => {
					this.closeEditModal();
				}, 1500);
			} else {
				this.editProductMessage = response.message;
				this.editProductSuccess = false;
			}

			this.isEditingProduct = false;
		},
		async confirmDelete(product) {
			if (
				confirm(
					`Are you sure you want to delete product "${product.name}"? This action cannot be undone.`
				)
			) {
				this.isDeletingProduct = true;
				this.deleteProductMessage = "";
				this.deleteProductSuccess = false;

				const imagePathsToDelete = product.colors
					.map((color) => color.image_path)
					.filter(Boolean);
				const response = await this.categoryProductStore.deleteProduct(
					product.id,
					imagePathsToDelete
				);

				if (response.success) {
					this.deleteProductMessage = response.message;
					this.deleteProductSuccess = true;
				} else {
					this.deleteProductMessage = response.message;
					this.deleteProductSuccess = false;
				}

				this.isDeletingProduct = false;

				setTimeout(() => {
					this.deleteProductMessage = "";
				}, 3000);
			}
		},
	},
};
</script>

<style scoped>
.box {
	border-top: 5px solid #00d1b2; /* Bulma primary color */
}
</style>
