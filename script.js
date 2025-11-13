let products = [];

async function loadProducts() {
  try {
    const response = await fetch('./data.json');
    if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json();

    products = data.map((item, index) => ({...item, id: index.toString()}))

    console.log('product loded:', products)
  } catch (error) {
    console.log('failed to load products:', error.message)
  }
}

//display product in the page
async function renderProducts() {
  await loadProducts()

  let productsHtml = '';

  products.forEach((product) => {
    productsHtml += `
      <div class="product-card">    
        <div class="image-container">

          <picture class="product-image">
            <source media="(max-width: 650px)" srcset="${product.image.mobile}">
            <source media="(max-width: 950px)" srcset="${product.image.tablet}">
            <img src="${product.image.desktop}" alt="${product.name}">
          </picture>
  
          <div class="add-to-cart-btn js-add-to-cart"
          data-product-id="${product.id}">
            <img src="./assets/images/icon-add-to-cart.svg">
            <h2>Add to Cart</h2>
          </div>

          <div class="product-details">
            <div class="product-category">${product.category}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price}</div>
          </div>

        </div>
      </div>
    `;
  })

  document.querySelector('.js-product-list-grid').innerHTML = productsHtml

  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    quantityButton(button)
  });
}
renderProducts()

//remove one from the product quntity 
function removeOneFromCart(productId) {
  cart.forEach((item) => {
    if (item.productId === productId && item.quantity > 0) {
      item.quantity -= 1;
    }
  });
}

// increment and decrement button
function quantityButton(button) {
  const productId = button.dataset.productId;
  let quantity = 0;
  let isSelected = false;

  button.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!isSelected) {
      isSelected = true;
      quantity = 1;

      addToCart(productId);
      renderCart();

      button.classList.add('select');
      button.innerHTML = `
        <img src="./assets/images/icon-decrement-quantity.svg" class="decrement">
        <div class="quantity-select">${quantity}</div>
        <img src="./assets/images/icon-increment-quantity.svg" class="increment">
      `;
    } else {
      if (e.target.classList.contains('increment')) {
        quantity++;
        button.querySelector('.quantity-select').textContent = quantity;
        addToCart(productId);
        renderCart();
      }

      if (e.target.classList.contains('decrement')) {
        if (quantity > 1) {
          quantity--;
          button.querySelector('.quantity-select').textContent = quantity;
          removeOneFromCart(productId);
          renderCart();
        } else {
          isSelected = false;
          quantity = 0;

          button.classList.remove('select');
          button.innerHTML = `
            <img src="./assets/images/icon-add-to-cart.svg">
            <h2>Add to Cart</h2>
          `;
          removeFromCart(productId);
          renderCart();
        }
      }
    }
  });
}


function getProduct(productId) {
  let matchingProduct;

  products.forEach((product) => {
    if(product.id === productId){
      matchingProduct = product
    }
  })
  return matchingProduct;
}


let cart = []

function addToCart(productId){
  let matchingItem;

  cart.forEach((cartItem) => {
    if(productId === cartItem.productId){
      matchingItem = cartItem
    }
  }); 

    if(matchingItem){
      matchingItem.quantity += 1
    }else{
      cart.push({
        productId: productId,
        quantity: 1,
      });
    }
}


function resetCart() {
  cart = []
}

function removeFromCart(productId){
  const newCart = []

  cart.forEach((cartItem) => {
    if(cartItem.productId !== productId){
      newCart.push(cartItem)
    }
  })
  cart = newCart
}


function renderCart() {
  let cartHtml = '';

  let totalOrderPrice = 0
  let totalQuantity = 0

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId)

    totalOrderPrice += product.price * cartItem.quantity
    totalQuantity += cartItem.quantity

    cartHtml += `
      <div class="item">
        <div class="item-info">
          <p class="item-name">${product.name}</p>
          <div class="item-details">
            <div class="item-quantity">${cartItem.quantity}x</div>
            <div class="item-unit-price">@ $${product.price}</div>
            <div class="item-total-price">$${product.price * cartItem.quantity}</div>
          </div>
        </div>

        <button class="remove-btn js-remove" data-product-id="${product.id}">
          <img src="./assets/images/icon-remove-item.svg">
        </button>
      </div>
    `
  })
  document.querySelector('.js-list-items').innerHTML = cartHtml;

  document.querySelector('.js-cart-quantity').innerHTML = `Your Cart (${totalQuantity})`
  document.querySelector('.js-order-total h2').innerHTML = `$${totalOrderPrice}`

  if(totalQuantity === 0){
    document.querySelector('.js-cart').style.display = 'none'
    document.querySelector('.js-cart-empty').style.display = 'flex'
  }else {
    document.querySelector('.js-cart').style.display = 'block'
    document.querySelector('.js-cart-empty').style.display = 'none'
  }

  document.querySelectorAll('.js-remove').forEach((button) => {
    button.addEventListener('click', () => {
      removeFromCart(button.dataset.productId)
      renderCart()
    })
  })
}
renderCart()


function renderOrder() {
  let orderHtml = '';
  
  let totalOrderPrice = 0

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId)

    totalOrderPrice += product.price * cartItem.quantity

    orderHtml += `
      <div class="order-item">
        <div class="order-info">
          <img src="${product.image.thumbnail}" class="order-item-image">
          <div class="order-details">
            <div class="order-item-name">${product.name}</div>
            <div class="details-down">
              <div class="order-item-quntity">${cartItem.quantity}x</div>
              <div class="order-item-unit-price">@ $${product.price}</div>
            </div>
          </div>
        </div>
        <div class="order-price">$${product.price * cartItem.quantity}</div>
      </div>
    `;
  });

  document.querySelector('.js-order-list-grid').innerHTML = orderHtml
  document.querySelector('.order-list-total h2').innerHTML = `$${totalOrderPrice}`
}
renderOrder()

//--------------------------

  const modalConfirm = document.querySelector('.order-confirm')
  const closeConfirm = document.querySelector('.close-confirm')

  document.querySelector('.js-order-btn').addEventListener('click', () => {
    renderOrder()
    modalConfirm.showModal()
  })

  closeConfirm.addEventListener('click', () => {
    modalConfirm.close()
    resetCart()
    renderCart()
  })

