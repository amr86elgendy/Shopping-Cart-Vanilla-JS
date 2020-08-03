// Variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// Cart
let cart = [];

// Get Buttons
let buttonsDOM = [];

// Getting The Products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items.map(item => {
        const { id } = item.sys;
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        return {id, title, price, image}
      })
      return products;
    } catch (error) {
      console.log(error);
    }
    
  }
}

// ------------ Display Products -------------
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      result += `
        <article class="product">
          <div class="img-container">
            <img src=${product.image} alt="product" class="product-img">
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
      `;
    });
    productsDOM.innerHTML = result;
  }
  getBagBtns() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach(btn => {
      let id = btn.dataset.id;
      let inCart = cart.find(item => item.id === id);
      
      if (inCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;
        // Get product from products
        let cartItem = {...Storage.getProduct(id), amount: 1};
        // Add  product to the cart
        cart = [...cart, cartItem];
        // Save cart in local storage
        Storage.saveCart(cart);
        // Set cart value
        this.setCartValues(cart);
        // Display cart item
        this.addCartItem(cartItem);
        // Show the cart
        this.showCart();
      })
    })
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    })
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src=${item.image} alt="product">
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <i class="fas fa-trash remove-item" data-id=${item.id}></i>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setUpApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart)
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    // Clear Cart Button
    clearCartBtn.addEventListener("click", () => this.clearCart())
    // Cart functionality
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id)
        }
      }
    })
  }
  clearCart() {
    // console.log(this);
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    // cartContent.innerHTML = '';
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id)
  }
}

// ------------------ Local Storage ------------------
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products))
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id)
    console.log(products);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart))
  }
  static getCart() {
    return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []
  }
}

// ---------------- Event Lisener -----------------
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // Setup App
  ui.setUpApp();
  // Get All Products
  products.getProducts().then(products => {
    ui.displayProducts(products)
    Storage.saveProducts(products)
  }).then(() => {
    ui.getBagBtns();
    ui.cartLogic();
  })
});







































